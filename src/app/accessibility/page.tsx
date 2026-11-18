import { buttonClass } from "@/components/ui/button";
import { readSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { errorText, keyboardHelp, noticeText, t } from "@/lib/i18n/messages";

export const metadata = { title: "Accessibility" };

export default async function AccessibilityPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const db = getDb();
  const user = await readSessionUser(db);
  const locale = user?.locale ?? "en";
  const copy = t(locale);
  const scale = user?.textScale ?? "1";
  const contrast = user?.contrast ?? "standard";
  const simpler = user?.simpler ?? false;
  const motion = user?.reducedMotion ?? false;
  const message = noticeText(locale, params.notice) ?? errorText(locale, params.error);
  const keys = keyboardHelp[locale === "es" ? "es" : "en"];

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="font-display text-5xl tracking-tight text-ink">{copy.accessTitle}</h1>
      <p className="mt-4 text-xl leading-9">{copy.accessLead}</p>
      {message ? (
        <p role="status" className="mt-4 rounded-2xl bg-good-bg px-4 py-3 font-semibold">
          {message}
        </p>
      ) : null}
      <form method="post" action="/api/preferences" className="mt-8 space-y-8">
        <input type="hidden" name="returnTo" value="/accessibility" />
        <input type="hidden" name="locale" value={locale} />
        <fieldset>
          <legend className="text-xl font-semibold">{copy.textSize}</legend>
          <div className="mt-3 grid gap-2">
            {[
              ["1", copy.textDefault],
              ["1.15", copy.textLarger],
              ["1.3", copy.textLargest],
            ].map(([value, label]) => (
              <label key={value} className="flex min-h-12 items-center gap-3 text-lg">
                <input type="radio" name="textScale" value={value} defaultChecked={scale === value} className="size-5" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-xl font-semibold">{copy.contrast}</legend>
          <div className="mt-3 grid gap-2">
            <label className="flex min-h-12 items-center gap-3 text-lg">
              <input type="radio" name="contrast" value="standard" defaultChecked={contrast === "standard"} className="size-5" />
              {copy.contrastStandard}
            </label>
            <label className="flex min-h-12 items-center gap-3 text-lg">
              <input type="radio" name="contrast" value="high" defaultChecked={contrast === "high"} className="size-5" />
              {copy.contrastHigh}
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-xl font-semibold">{copy.simpler}</legend>
          <p className="mt-2 text-lg text-muted">{copy.simplerHint}</p>
          <input type="hidden" name="simpler" value="0" />
          <label className="mt-3 flex min-h-12 items-center gap-3 text-lg">
            <input type="checkbox" name="simpler" value="1" defaultChecked={simpler} className="size-5" />
            {copy.simpler}
          </label>
        </fieldset>
        <fieldset>
          <legend className="text-xl font-semibold">{copy.motion}</legend>
          <p className="mt-2 text-lg text-muted">{copy.motionHint}</p>
          <input type="hidden" name="reducedMotion" value="0" />
          <label className="mt-3 flex min-h-12 items-center gap-3 text-lg">
            <input type="checkbox" name="reducedMotion" value="1" defaultChecked={motion} className="size-5" />
            {copy.motion}
          </label>
        </fieldset>
        <button type="submit" className={buttonClass("primary", "xl")}>
          {copy.saveSettings}
        </button>
      </form>

      <section className="mt-10" aria-labelledby="keyboard-heading">
        <h2 id="keyboard-heading" className="font-display text-3xl text-ink">
          {copy.keyboardTitle}
        </h2>
        <ul className="mt-4 space-y-3">
          {keys.map((item) => (
            <li key={item.keys} className="rounded-2xl border border-line bg-card px-4 py-3">
              <p className="font-semibold">{item.keys}</p>
              <p className="text-lg">{item.meaning}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
