import { cn } from "@/lib/cn";

const tones = {
  neutral: "bg-white text-ink border-line",
  good: "bg-good-bg text-good border-good/30",
  caution: "bg-caution-bg text-caution border-caution/30",
  info: "bg-white text-blue-deep border-blue/30",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span className={cn("inline-flex min-h-8 items-center rounded-full border px-3 text-sm font-semibold", tones[tone])}>
      {children}
    </span>
  );
}
