"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", background: "#FBFAF6", color: "#20272B", margin: 0 }}>
        <main id="main" style={{ maxWidth: 720, margin: "0 auto", padding: "48px 16px" }}>
          <h1 style={{ fontSize: "2.5rem" }}>This screen did not finish loading</h1>
          <p>Lumen did not mark a step done. Anything already saved is still on this server.</p>
          {error.digest ? <p>Reference {error.digest}</p> : null}
          <button type="button" onClick={reset} style={{ minHeight: 48, marginTop: 16 }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
