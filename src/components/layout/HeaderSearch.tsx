"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { ProductJson } from "@/lib/serialize";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function formatZar(n: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function HeaderSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductJson[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const collapse = useCallback(() => {
    setExpanded(false);
    setHovered(false);
    setFocused(false);
    setResults([]);
    setActiveIndex(-1);
  }, []);

  const handleMouseEnter = () => {
    setHovered(true);
    setExpanded(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (document.activeElement !== inputRef.current) {
      collapse();
    }
  };

  const handleFocus = () => {
    setFocused(true);
    setHovered(true);
    setExpanded(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    setFocused(false);
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      collapse();
    }
  };

  const runSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=6`)
        .then((res) => res.json())
        .then((data: { products?: ProductJson[] }) => {
          setResults(data.products ?? []);
          setActiveIndex(-1);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    },
    []
  );

  useEffect(() => {
    if (!expanded) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), 280);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [expanded, query, runSearch]);

  function goToShop(search?: string) {
    const trimmed = (search ?? query).trim();
    if (!trimmed) return;
    collapse();
    setQuery("");
    router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    goToShop();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      if (!results.length) return;
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      if (!results.length) return;
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0 && activeIndex >= 0) {
        const product = results[activeIndex];
        collapse();
        setQuery("");
        router.push(`/product/${product.slug}`);
      } else {
        goToShop();
      }
    } else if (e.key === "Escape") {
      collapse();
      inputRef.current?.blur();
    }
  }

  const isOpen = expanded || hovered || focused;
  const showDropdown = isOpen && query.trim().length > 0;

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <form
        onSubmit={onSubmit}
        className={`flex items-center overflow-hidden rounded-full border transition-all duration-300 ease-out ${
          isOpen
            ? "w-40 border-zinc-700/90 bg-zinc-900/90 shadow-sm shadow-black/30"
            : "w-9 border-transparent bg-transparent"
        }`}
      >
        <button
          type="submit"
          aria-label="Search products"
          onClick={() => {
            setHovered(true);
            setExpanded(true);
            setFocused(true);
            inputRef.current?.focus();
          }}
          className="flex h-9 w-9 shrink-0 items-center justify-center text-zinc-400 transition hover:text-amber-300"
        >
          <SearchIcon className="h-4 w-4" />
        </button>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          placeholder={isOpen ? "Search" : ""}
          aria-label="Search products"
          className={`min-w-0 bg-transparent text-sm text-zinc-100 outline-none transition-all duration-300 ease-out placeholder:text-zinc-500 ${
            isOpen ? "w-full pr-2 opacity-100" : "w-0 opacity-0"
          }`}
        />
      </form>

      {showDropdown && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          {loading && (
            <p className="px-3 py-3 text-xs text-zinc-500">Searching…</p>
          )}

          {!loading && results.length === 0 && (
            <p className="px-3 py-3 text-xs text-zinc-500">No matching products.</p>
          )}

          {!loading && results.length > 0 && (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((product, index) => {
                const price =
                  product.isSpecial && product.specialPrice != null
                    ? product.specialPrice
                    : product.price;

                return (
                  <li key={product.id}>
                    <Link
                      href={`/product/${product.slug}`}
                      tabIndex={-1}
                      onMouseDown={(e) => e.preventDefault()}
                      className={`flex items-center gap-3 px-3 py-2 transition hover:bg-zinc-900 ${
                        index === activeIndex ? "bg-zinc-900" : ""
                      }`}
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-zinc-900">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-600">
                            ♪
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-100">
                          {product.name}
                        </p>
                        <p className="truncate text-[11px] text-zinc-500">
                          {product.category?.name ?? "Product"} · {formatZar(price)}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {!loading && query.trim() && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => goToShop()}
              className="w-full border-t border-zinc-800 px-3 py-2.5 text-left text-xs font-semibold text-amber-400 transition hover:bg-zinc-900"
            >
              View all results for &ldquo;{query.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
