"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/button";

export function ReadAloud({
  text,
  lang,
  readLabel,
  stopLabel,
  note,
  unsupported,
  working,
}: {
  text: string;
  lang: string;
  readLabel: string;
  stopLabel: string;
  note: string;
  unsupported: string;
  working: string;
}) {
  const [state, setState] = useState<"idle" | "speaking" | "unsupported">("idle");

  function stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setState("idle");
  }

  function start() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setState("unsupported");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onend = () => setState("idle");
    utterance.onerror = () => setState("unsupported");
    window.speechSynthesis.speak(utterance);
    setState("speaking");
  }

  return (
    <div className="rounded-card border border-line bg-white p-4">
      <p className="text-base text-muted">{note}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" className={buttonClass("secondary")} onClick={state === "speaking" ? stop : start}>
          {state === "speaking" ? stopLabel : readLabel}
        </button>
      </div>
      {state === "speaking" ? (
        <p role="status" className="mt-3 font-semibold text-ink">
          {working}
        </p>
      ) : null}
      {state === "unsupported" ? (
        <p role="status" className="mt-3 font-semibold text-caution">
          {unsupported}
        </p>
      ) : null}
    </div>
  );
}
