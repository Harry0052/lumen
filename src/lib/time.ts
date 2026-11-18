export function nowIso(now = new Date()) {
  return now.toISOString();
}

export function addDays(iso: string, days: number) {
  return new Date(Date.parse(iso) + days * 24 * 60 * 60 * 1000).toISOString();
}

export function isPast(iso: string | null, now = new Date()) {
  if (!iso) return true;
  return Date.parse(iso) <= now.getTime();
}

export function formatUtc(iso: string | null) {
  if (!iso) return "No date";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const formatted = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "UTC",
  }).format(date);
  return `${formatted} UTC`;
}
