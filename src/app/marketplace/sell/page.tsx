"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";

type ConditionValue = "New" | "Like New" | "Good" | "Fair";

type FormState = {
  title: string;
  price: string;
  condition: ConditionValue | "";
  description: string;
  sellerName: string;
  sellerPhone: string;
  location: string;
};

const conditionOptions: Array<{ value: ConditionValue; label: string; detail: string }> = [
  { value: "New", label: "New", detail: "Factory fresh or unopened" },
  { value: "Like New", label: "Like New", detail: "Minimal wear, excellent condition" },
  { value: "Good", label: "Good", detail: "Used regularly, fully functional" },
  { value: "Fair", label: "Fair", detail: "Working condition with cosmetic wear" },
];

const initialFormState: FormState = {
  title: "",
  price: "",
  condition: "",
  description: "",
  sellerName: "",
  sellerPhone: "",
  location: "",
};

export default function SellPage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(true);

  const imageSummary = useMemo(() => {
    if (!images.length) return "Add at least one clear photo of your gear";
    if (images.length === 1) return `${images[0].name}`;
    return `${images.length} photos selected`;
  }, [images]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (!selected.length) return;

    if (error) setError(null);
    setImages((prev) => [...prev, ...selected]);

    const uploadedUrls: string[] = [];
    for (const file of selected) {
      const fd = new FormData();
      fd.set("file", file);
      try {
        const res = await fetch("/api/uploads", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok || typeof data.url !== "string") {
          throw new Error(typeof data.error === "string" ? data.error : "Image upload failed.");
        }
        uploadedUrls.push(data.url);
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
        return;
      }
    }

    setImageUrls((prev) => [...prev, ...uploadedUrls]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmedTitle = form.title.trim();
    const trimmedDescription = form.description.trim();
    const trimmedSellerName = form.sellerName.trim();
    const trimmedSellerPhone = form.sellerPhone.trim();
    const trimmedLocation = form.location.trim();
    const numericPrice = Number(form.price);

    if (!trimmedTitle || !form.price || !form.condition || !trimmedDescription || !trimmedSellerName || !trimmedSellerPhone || !trimmedLocation || images.length === 0) {
      setError("Please complete every required field and attach at least one image before submitting.");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Please enter a valid asking price in ZAR.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: trimmedTitle,
        price: numericPrice,
        condition: form.condition,
        description: trimmedDescription,
        sellerName: trimmedSellerName,
        sellerPhone: trimmedSellerPhone,
        location: trimmedLocation,
        imageCount: images.length,
        imageUrls,
      };

      const response = await fetch("/api/marketplace/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 503) {
        setError(
          data?.error ||
            "Marketplace temporarily unavailable. Please try again later or contact support."
        );
        setSubmitting(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data?.error || "Your listing could not be submitted right now.");
      }

      setSuccess(true);
      setForm(initialFormState);
      setImages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your listing could not be submitted right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.14),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#09090b_100%)] px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      {showWarning ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowWarning(false)} />
          <div className="relative max-w-2xl rounded-2xl border border-amber-400/30 bg-zinc-950/95 p-4 text-sm text-zinc-100 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-semibold text-amber-300">⚠️ Stay Safe When Buying &amp; Selling</p>
                <p className="mt-2 text-sm text-zinc-300">
                  Beware of scammers. Always arrange to meet in a well-lit, public location, and never transfer money or release equipment before inspecting the item in person.
                </p>
              </div>
              <div className="flex-shrink-0">
                <button
                  aria-label="Close warning"
                  onClick={() => setShowWarning(false)}
                  className="rounded-full bg-zinc-800/60 px-3 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-800/80"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-zinc-800/80 bg-zinc-950/70 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-12 w-12">
              <Image
                src="/MkH.png"
                alt="MkhSounds Logo"
                fill
                className="object-contain"
                sizes="48px"
                priority
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">MkhSounds</p>
              <p className="text-xs text-zinc-500">Back to the storefront</p>
            </div>
          </Link>
          <Link
            href="/"
            className="rounded-full border border-zinc-700 bg-zinc-900/70 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-amber-400 hover:text-amber-200"
          >
            Home
          </Link>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-zinc-800/80 bg-zinc-950/80 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 px-6 py-8 sm:px-8 lg:px-10">
            <p className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-300">
              Buy & Sell
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Sell Your Sound Gear on Mkh Sounds
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
              Turn your unused audio equipment into cash. Approved listings will appear directly in our 2nd Hand Equipment shop.
            </p>
          </div>

          <div className="px-6 py-8 sm:px-8 lg:px-10">
            {error ? (
              <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-200">
                <p className="font-semibold text-emerald-100">Listing submitted!</p>
                <p className="mt-1 leading-6">
                  Our team will verify your gear and publish it in our 2nd Hand Equipment section soon.
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-flex rounded-full bg-amber-500 px-4 py-2 font-semibold text-zinc-950 transition hover:bg-amber-400"
                >
                  Go home
                </Link>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-zinc-200">Product Title</span>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      className="w-full rounded-2xl border border-zinc-700 bg-zinc-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                      placeholder="Pioneer TS-W312D4 Subwoofer"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-zinc-200">Asking Price (ZAR)</span>
                    <input
                      required
                      type="number"
                      min="1"
                      step="1"
                      value={form.price}
                      onChange={(e) => updateField("price", e.target.value)}
                      className="w-full rounded-2xl border border-zinc-700 bg-zinc-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                      placeholder="3500"
                    />
                  </label>
                </div>

                <div>
                  <span className="mb-3 block text-sm font-medium text-zinc-200">Condition</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {conditionOptions.map((option) => {
                      const selected = form.condition === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateField("condition", option.value)}
                          className={`rounded-2xl border px-4 py-4 text-left transition ${selected ? "border-amber-400 bg-amber-500/10 shadow-[0_0_0_1px_rgba(251,191,36,0.2)]" : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`h-3.5 w-3.5 rounded-full border ${selected ? "border-amber-400 bg-amber-400" : "border-zinc-500"}`} />
                            <span className="font-semibold text-white">{option.label}</span>
                          </div>
                          <p className="mt-2 text-sm text-zinc-500">{option.detail}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-zinc-200">Detailed Description</span>
                  <textarea
                    required
                    rows={7}
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                    placeholder="Add speaker specs, voice coil details, box dimensions, or the history of the item."
                  />
                </label>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Image Upload</p>
                      <p className="mt-1 text-sm text-zinc-500">Attach at least one photo of your gear.</p>
                    </div>
                    <label className="cursor-pointer rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20">
                      Choose files
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                  <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-400">
                    {imageSummary}
                  </div>
                  {images.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {images.map((image, index) => (
                        <li key={`${image.name}-${index}`} className="truncate text-sm text-zinc-300">
                          • {image.name}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="grid gap-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-zinc-200">Full Name</span>
                    <input
                      required
                      value={form.sellerName}
                      onChange={(e) => updateField("sellerName", e.target.value)}
                      className="w-full rounded-2xl border border-zinc-700 bg-zinc-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                      placeholder="Sipho Ndlovu"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-zinc-200">WhatsApp Number</span>
                    <input
                      required
                      value={form.sellerPhone}
                      onChange={(e) => updateField("sellerPhone", e.target.value)}
                      className="w-full rounded-2xl border border-zinc-700 bg-zinc-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                      placeholder="071 234 5678"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-zinc-200">City / Province</span>
                    <input
                      required
                      value={form.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      className="w-full rounded-2xl border border-zinc-700 bg-zinc-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                      placeholder="Cape Town, Western Cape"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Submitting listing..." : "Submit listing"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
