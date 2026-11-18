import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-10">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-4 h-14 w-full max-w-xl" />
      <Skeleton className="mt-6 h-40 w-full" />
      <p role="status" className="mt-4 text-base font-semibold text-muted">
        Loading Lumen…
      </p>
    </main>
  );
}
