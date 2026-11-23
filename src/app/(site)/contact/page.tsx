import Link from "next/link";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-white">Contact</h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        Whether you are upgrading a daily driver or chasing SPL goals, the team at MkhSounds
        can guide signal chain, power, and acoustics — starting with the right products from
        this store.
      </p>

      <div className="mt-10 space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</h2>
          <a
            href="mailto:hello@mkhsounds.co.za"
            className="mt-1 inline-block text-lg font-semibold text-amber-400 hover:text-amber-300"
          >
            hello@mkhsounds.co.za
          </a>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Web</h2>
          <p className="mt-1 text-zinc-300">mkhsounds.co.za</p>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Hours</h2>
          <p className="mt-1 text-sm text-zinc-300">
            Contact us for showroom visits and install bookings — this demo storefront runs
            locally; extend this section with your trading hours and map embed when you are
            ready to publish.
          </p>
        </div>
      </div>

      <p className="mt-8 text-sm text-zinc-500">
        Looking for a specific SKU?{" "}
        <Link href="/shop" className="text-amber-400 hover:underline">
          Browse the shop
        </Link>
        .
      </p>
    </div>
  );
}
