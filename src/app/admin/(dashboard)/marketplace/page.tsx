import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MarketplaceListingInfoModal } from "@/components/admin/MarketplaceListingInfoModal";

export const dynamic = "force-dynamic";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "DECLINED";

type MarketplaceListing = {
  id: string;
  title: string;
  price: number | string;
  condition: string;
  description: string;
  sellerName: string;
  sellerWhatsapp: string;
  location: string;
  status: string;
  createdAt: Date;
  imageUrls: string[];
};

function formatCurrency(value: number | string) {
  const amount = typeof value === "number" ? value : Number(value);
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

async function getListings(status: StatusFilter) {
  const where = status === "ALL" ? {} : { status };

  const listings = await prisma.secondHandProduct.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
      condition: true,
      description: true,
      sellerName: true,
      sellerWhatsapp: true,
      location: true,
      status: true,
      createdAt: true,
      imageUrls: true,
    },
  });

  return listings.map((listing) => ({
    ...listing,
    price: Number(listing.price),
    imageUrls: (
      Array.isArray(listing.imageUrls)
        ? (listing.imageUrls as string[])
        : JSON.parse((listing.imageUrls as unknown as string) || "[]") as string[]
    ),
  }));
}

export default async function MarketplaceAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = (params?.status?.toUpperCase() as StatusFilter) || "ALL";
  const validStatus = ["ALL", "PENDING", "APPROVED", "DECLINED"].includes(statusFilter)
    ? statusFilter
    : "ALL";
  // If the Prisma model wasn't generated (schema changed but client not updated),
  // prisma.secondHandProduct will be undefined which causes a runtime TypeError.
  const hasSecondHand = Boolean((prisma as unknown as Record<string, unknown>).secondHandProduct);

  if (!hasSecondHand) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
          <h1 className="text-2xl font-semibold text-white">Marketplace not configured</h1>
          <p className="mt-2 text-sm text-zinc-400">
            The database model for second-hand listings is not available in your Prisma client.
            This usually means the Prisma schema changed but the client wasn&apos;t regenerated or
            migrations weren&apos;t applied.
          </p>
          <div className="mt-4 rounded-md bg-zinc-950/60 p-4 text-sm text-zinc-200">
            <p className="font-semibold">Quick fixes</p>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-zinc-400">
              <li>Run <code>npx prisma migrate dev</code> to apply migrations (if needed).</li>
              <li>Run <code>npx prisma generate</code> to regenerate the Prisma client.</li>
              <li>Restart the Next.js dev server.</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  const listings = await getListings(validStatus);

  const filters: Array<{ value: StatusFilter; label: string }> = [
    { value: "ALL", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "DECLINED", label: "Declined" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Marketplace submissions</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Review seller listings and approve or decline them before publishing.
          </p>
        </div>
        <form method="get" action="/admin/marketplace" className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-300">Status</span>
            <label className="text-sm text-zinc-300">
              <select
                name="status"
                defaultValue={validStatus}
                className="rounded-2xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-amber-500/50 focus:border-amber-400 focus:ring-2"
              >
                {filters.map((filter) => (
                  <option key={filter.value} value={filter.value.toLowerCase()}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="submit"
            className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
          >
            Apply
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-800 text-sm">
            <thead className="bg-zinc-950/70 text-left text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Seller</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Condition</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Info</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-200">
              {listings.map((listing) => (
                <tr key={listing.id} className="align-top">
                  <td className="max-w-xs px-4 py-3">
                    <p className="font-medium text-white">{listing.title}</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">{listing.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{listing.sellerName}</p>
                    <p className="mt-1 text-xs text-zinc-500">{listing.sellerWhatsapp}</p>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(listing.price)}</td>
                  <td className="px-4 py-3">{listing.condition}</td>
                  <td className="px-4 py-3">{listing.location}</td>
                  <td className="px-4 py-3">
                    <MarketplaceListingInfoModal listing={listing} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-300">
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <form action="/api/admin/marketplace" method="post">
                        <input type="hidden" name="id" value={listing.id} />
                        <input type="hidden" name="status" value="APPROVED" />
                        <button
                          type="submit"
                          className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
                        >
                          Approve
                        </button>
                      </form>
                      <form action="/api/admin/marketplace" method="post">
                        <input type="hidden" name="id" value={listing.id} />
                        <input type="hidden" name="status" value="DECLINED" />
                        <button
                          type="submit"
                          className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-500"
                        >
                          Decline
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
