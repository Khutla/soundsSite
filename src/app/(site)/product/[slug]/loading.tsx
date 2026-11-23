export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-4 w-40 animate-pulse rounded bg-zinc-800" />
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-3xl bg-zinc-900" />
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-zinc-800" />
          <div className="h-10 w-full max-w-md animate-pulse rounded bg-zinc-800" />
          <div className="h-8 w-40 animate-pulse rounded bg-zinc-800" />
          <div className="h-24 w-full animate-pulse rounded bg-zinc-900" />
          <div className="h-12 w-40 animate-pulse rounded-full bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
