"use client";

import { useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";

export function ProgressForm({
  action,
  className,
  pendingLabel,
  errors,
  children,
}: {
  action: string;
  className?: string;
  pendingLabel: string;
  errors: Record<string, string>;
  children: ReactNode;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setError(null);
    try {
      const response = await fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { accept: "application/json" },
      });
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        redirectTo?: string;
        error?: { code?: string; message?: string };
      } | null;
      if (!response.ok || !data?.ok || !data.redirectTo) {
        const code = data?.error?.code ?? "generic";
        setError(errors[code] ?? errors.generic ?? data?.error?.message ?? errors.network);
        setPending(false);
        return;
      }
      window.location.assign(data.redirectTo);
    } catch {
      setError(errors.network);
      setPending(false);
    }
  }

  return (
    <form method="post" action={action} onSubmit={onSubmit} className={className} data-ready={ready ? "yes" : "no"}>
      {children}
      {pending ? (
        <p role="status" className="mt-3 text-base font-semibold text-ink">
          {pendingLabel}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-base font-semibold text-caution">
          {error}
        </p>
      ) : null}
    </form>
  );
}
