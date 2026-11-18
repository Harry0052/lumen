"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main" className="mx-auto flex w-full max-w-3xl flex-col px-4 py-16">
      <h1 className="font-display text-5xl tracking-tight text-ink">This screen did not finish loading</h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
        Lumen did not mark a step done. Anything already saved is still on this server.
      </p>
      <p className="mt-3 max-w-xl text-lg leading-8 text-muted">
        Lumen no marcó un paso. Lo que ya estaba guardado sigue en este servidor.
      </p>
      {error.digest ? <p className="sr-only">Reference {error.digest}</p> : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="inline-flex min-h-12 items-center rounded-2xl bg-blue px-5 font-semibold text-white">
          Try again
        </button>
        <Link href="/" className="inline-flex min-h-12 items-center rounded-2xl border-2 border-line bg-card px-5 font-semibold text-ink">
          Back to Help
        </Link>
      </div>
    </main>
  );
}
