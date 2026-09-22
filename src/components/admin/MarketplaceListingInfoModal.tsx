"use client";

import Image from "next/image";
import { useState } from "react";

type MarketplaceListing = {
  id: string;
  title: string;
  price: number | string;
  condition: string;
  description: string;
  sellerName: string;
  sellerPhone: string;
  location: string;
  status: string;
  createdAt: Date;
  imageUrls: string[];
};

export function MarketplaceListingInfoModal({ listing }: { listing: MarketplaceListing }) {
  const [open, setOpen] = useState(false);

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
                  <p className="text-xs text-zinc-500">{listing.imageUrls.length} image{listing.imageUrls.length === 1 ? "" : "s"}</p>
                </div>

                {listing.imageUrls.length > 0 ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {listing.imageUrls.map((url, index) => (
                      <div key={index} className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
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
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
