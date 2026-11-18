import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import type { GuideCard } from "@/lib/guides/catalog";
import { formatUtc } from "@/lib/time";
import { t, topicLabel, type Copy } from "@/lib/i18n/messages";

export function GuideCardView({ card, locale }: { card: GuideCard; locale: string }) {
  const copy = t(locale);
  const freshness = card.freshness;
  return (
    <article className={`flex h-full flex-col rounded-card border-2 bg-card p-5 shadow-sm ${freshness === "stale" ? "border-caution" : "border-line"}`}>
      <div className="flex flex-wrap gap-2">
        {card.isDemo ? <Badge>{copy.demoBadge}</Badge> : null}
        <Badge tone={freshness === "current" ? "good" : freshness === "stale" ? "caution" : "info"}>
          {freshness === "current" ? copy.reviewedBadge : freshness === "stale" ? copy.staleBadge : copy.unverifiedBadge}
        </Badge>
        <Badge tone="info">{topicLabel(locale, card.topic)}</Badge>
        {card.fallback ? <Badge tone="caution">{copy.englishOnly}</Badge> : null}
        {card.localeUsed === "es" ? <Badge>{copy.sampleSpanish}</Badge> : null}
      </div>
      <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-ink">{card.title}</h2>
      <p className="mt-3 text-lg leading-8 text-ink">{card.summary}</p>
      <p className="mt-4 text-base text-muted">
        {copy.sourceLabel}: {card.sourceTitle}
      </p>
      <p className="text-base text-muted">
        {copy.reviewedOn}: {formatUtc(card.reviewedAt)}
      </p>
      <p className="text-base text-muted">
        {copy.reviewDue}: {formatUtc(card.reviewDueAt)}
      </p>
      <p className="mt-2 text-base font-semibold text-ink">
        {card.stepCount} {copy.stepsWord}
      </p>
      <Link href={`/guides/${card.slug}`} className={`${buttonClass("primary")} mt-5 w-fit`}>
        {copy.openGuide}
      </Link>
    </article>
  );
}

export function freshnessCopy(copy: Copy, freshness: GuideCard["freshness"]) {
  if (freshness === "stale") return copy.staleDetail;
  if (freshness === "unverified") return copy.unverifiedBadge;
  return null;
}
