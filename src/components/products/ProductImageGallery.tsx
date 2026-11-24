"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

function ImageVignette() {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/75 via-black/20 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
    </>
  );
}

function GalleryArrow({
  direction,
  onClick,
}: {
  direction: "previous" | "next";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "previous" ? "Previous image" : "Next image"}
      className="absolute top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/55 text-white shadow-lg transition hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-amber-400"
      style={{ [direction === "previous" ? "left" : "right"]: "1rem" }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
      >
        <path
          d={direction === "previous" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </button>
  );
}

export function ProductImageGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const activeImage = images[activeIndex];
  const hasMultipleImages = images.length > 1;

  const changeImage = useCallback((direction: -1 | 1) => {
    if (!images.length) return;
    setActiveIndex((current) => (current + direction + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isEnlarged) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsEnlarged(false);
      if (hasMultipleImages && event.key === "ArrowLeft") changeImage(-1);
      if (hasMultipleImages && event.key === "ArrowRight") changeImage(1);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [changeImage, hasMultipleImages, isEnlarged]);

  return (
    <>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60">
        {activeImage ? (
          <>
            <Image
              src={activeImage}
              alt={alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              unoptimized
            />
            <button
              type="button"
              onClick={() => setIsEnlarged(true)}
              aria-label={`Enlarge image ${activeIndex + 1} of ${images.length}`}
              className="absolute inset-0 z-10 cursor-zoom-in"
            />
            <ImageVignette />
            {hasMultipleImages ? (
              <>
                <GalleryArrow direction="previous" onClick={() => changeImage(-1)} />
                <GalleryArrow direction="next" onClick={() => changeImage(1)} />
                <span className="absolute bottom-4 right-4 z-30 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                  {activeIndex + 1} / {images.length}
                </span>
              </>
            ) : null}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-black">
            <span className="text-8xl text-zinc-700">♪</span>
          </div>
        )}
      </div>

      {isEnlarged && activeImage ? (
        <div
          role="presentation"
          onClick={() => setIsEnlarged(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${alt} image viewer`}
            onClick={(event) => event.stopPropagation()}
            className="relative h-full w-full"
          >
            <Image
              src={activeImage}
              alt={alt}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized
            />
            <ImageVignette />
            <button
              type="button"
              onClick={() => setIsEnlarged(false)}
              aria-label="Close image viewer"
              className="absolute right-2 top-2 z-30 rounded-full border border-white/30 bg-black/60 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85 focus:outline-none focus:ring-2 focus:ring-amber-400 sm:right-4 sm:top-4"
            >
              Close
            </button>
            {hasMultipleImages ? (
              <>
                <GalleryArrow direction="previous" onClick={() => changeImage(-1)} />
                <GalleryArrow direction="next" onClick={() => changeImage(1)} />
                <span className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                  {activeIndex + 1} / {images.length}
                </span>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
