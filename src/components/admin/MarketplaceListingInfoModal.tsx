"use client";

import Image from "next/image";
import { useState, type ChangeEvent } from "react";
import { ensureBrowserCsrfToken, withCsrfHeader } from "@/lib/csrf";

type MarketplaceListing = {
  id: string;
  title: string;
  price: number | string;
  condition: string;
  description: string;
  sellerName: string | null;
  sellerPhone: string | null;
  location: string | null;
  status: string;
  createdAt: Date;
  imageUrls: string[];
};

export function MarketplaceListingInfoModal({ listing }: { listing: MarketplaceListing }) {
  const [open, setOpen] = useState(false);
  const [imageUrls, setImageUrls] = useState(listing.imageUrls);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageNotice, setImageNotice] = useState<string | null>(null);

  async function addImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (!files.length) return;

    setUploadingImages(true);
    setImageError(null);
    setImageNotice(null);

    try {
      const csrfToken = await ensureBrowserCsrfToken();
      if (!csrfToken) {
        throw new Error("Could not get a security token. Refresh the page and try again.");
      }

      const uploadedUrls: string[] = [];
      let failedUploads = 0;
      let firstUploadError: string | null = null;

      for (const file of files) {
        try {
          const formData = new FormData();
          formData.set("file", file);
          formData.set("csrfToken", csrfToken);

          const response = await fetch("/api/admin/upload", {
            method: "POST",
            headers: withCsrfHeader(undefined, csrfToken),
            body: formData,
          });
          const data = await response.json();

          if (!response.ok || typeof data.url !== "string") {
            throw new Error(
              typeof data.error === "string" ? data.error : "Image upload failed."
            );
          }

          uploadedUrls.push(data.url);
        } catch (error) {
          failedUploads += 1;
          firstUploadError ??=
            error instanceof Error ? error.message : "Image upload failed.";
        }
      }

      if (!uploadedUrls.length) {
        throw new Error(firstUploadError ?? "No images were uploaded.");
      }

      const response = await fetch(
        `/api/admin/marketplace/${encodeURIComponent(listing.id)}/images`,
        {
          method: "POST",
          headers: withCsrfHeader(
            { "Content-Type": "application/json" },
            csrfToken
          ),
          body: JSON.stringify({ imageUrls: uploadedUrls }),
        }
      );
      const data = await response.json();

      if (!response.ok || !Array.isArray(data.imageUrls)) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Could not attach the uploaded images to this listing."
        );
      }

      setImageUrls(data.imageUrls);
      if (failedUploads) {
        setImageError(
          `${uploadedUrls.length} image(s) added; ${failedUploads} failed. ${firstUploadError ?? ""}`.trim()
        );
      } else {
        setImageNotice(
          `${uploadedUrls.length} image${uploadedUrls.length === 1 ? "" : "s"} added.`
        );
      }
    } catch (error) {
      setImageError(
        error instanceof Error
          ? error.message
          : "Could not add images to this listing."
      );
    } finally {
      setUploadingImages(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="View listing info"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
      >
        i
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800 px-6 py-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">Listing details</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{listing.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-6 p-6 text-sm text-zinc-200">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Price</p>
                  <p className="text-lg font-semibold text-white">{typeof listing.price === "number" ? new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(listing.price) : listing.price}</p>
                </div>
                <div className="space-y-2 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Condition</p>
                  <p className="text-lg font-semibold text-white">{listing.condition}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Location</p>
                  <p className="mt-1 font-medium text-white">{listing.location}</p>
                </div>
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Seller</p>
                  <p className="mt-1 font-medium text-white">{listing.sellerName}</p>
                  <p className="mt-1 text-zinc-400">{listing.sellerPhone}</p>
                </div>
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Status</p>
                  <p className="mt-1 font-medium text-white">{listing.status}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Description</p>
                <p className="mt-2 whitespace-pre-wrap text-zinc-200">{listing.description}</p>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Uploaded images</p>
                  <p className="text-xs text-zinc-500">{imageUrls.length} image{imageUrls.length === 1 ? "" : "s"}</p>
                </div>

                {imageUrls.length > 0 ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {imageUrls.map((url, index) => (
                      <div key={`${url}-${index}`} className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
                        <div className="relative h-44 w-full">
                          <Image
                            src={url}
                            alt={`Listing image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-zinc-500">No uploaded images available.</p>
                )}

                <div className="mt-4">
                  <label className="inline-flex cursor-pointer items-center rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                    {uploadingImages ? "Uploading images..." : "Add photos"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      disabled={uploadingImages}
                      onChange={addImages}
                      className="sr-only"
                    />
                  </label>
                  <p className="mt-2 text-xs text-zinc-500">JPG, PNG, WebP or GIF · max 5MB each</p>
                  {imageError ? (
                    <p className="mt-2 text-sm text-red-400" role="alert">{imageError}</p>
                  ) : null}
                  {imageNotice ? (
                    <p className="mt-2 text-sm text-emerald-400" role="status">{imageNotice}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
