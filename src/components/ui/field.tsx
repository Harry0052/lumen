import type { ReactNode } from "react";

export const inputClass =
  "min-h-14 w-full rounded-2xl border-2 border-line bg-card px-4 text-lg text-ink placeholder:text-muted";

export function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string | null;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-base text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-base font-semibold text-caution">
          {error}
        </p>
      ) : null}
    </div>
  );
}
