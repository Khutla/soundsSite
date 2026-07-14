import Link from "next/link";
import { prisma } from "@/lib/prisma";

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

  return prisma.secondHandProduct.findMany({
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
    },
  }) as Promise<MarketplaceListing[]>;
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
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const active = validStatus === filter.value;
            return (
              <Link
                key={filter.value}
                href={`/admin/marketplace${filter.value === "ALL" ? "" : `?status=${filter.value.toLowerCase()}`}`}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-amber-500 text-zinc-950"
                    : "border border-zinc-700 bg-zinc-900/70 text-zinc-300 hover:border-zinc-600"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
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
