"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";

export function CopyLink({ url, label, copied, failed }: { url: string; label: string; copied: string; failed: string }) {
  const [message, setMessage] = useState<string | null>(null);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage(copied);
    } catch {
      setMessage(failed);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor="share-url" className="text-base font-semibold text-ink">
        {label}
      </label>
      <input id="share-url" readOnly value={url} className={inputClass} />
      <button type="button" className={`${buttonClass("secondary")} w-fit`} onClick={onCopy}>
        {label}
      </button>
      {message ? (
        <p role="status" className="font-semibold text-ink">
          {message}
        </p>
      ) : null}
    </div>
  );
}
