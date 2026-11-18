import { readSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { limitItems, t } from "@/lib/i18n/messages";
import { flags } from "@/lib/flags";

export const metadata = { title: "Limits" };

export default async function LimitsPage() {
  const user = await readSessionUser(getDb());
  const locale = user?.locale ?? "en";
  const copy = t(locale);
  const items = limitItems[locale === "es" ? "es" : "en"];

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="font-display text-5xl tracking-tight text-ink">{copy.limitsTitle}</h1>
      <p className="mt-4 text-xl leading-9">{copy.limitsLead}</p>
      <ul className="mt-8 space-y-4">
        {items.map((item) => (
          <li key={item.title} className="rounded-card border border-line bg-card p-5">
            <h2 className="text-2xl font-semibold">{item.title}</h2>
            <p className="mt-2 text-lg leading-8">{item.body}</p>
          </li>
        ))}
      </ul>
      <section className="mt-6 rounded-card border border-line bg-white p-5">
        <h2 className="text-2xl font-semibold">{copy.llmTitle}</h2>
        <p className="mt-2 text-lg leading-8">{copy.llmBody}</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-base text-muted">
          <li>Language model: {flags.llmRewrite ? "on" : "off"}</li>
          <li>Form submission: {flags.formSubmission ? "on" : "off"}</li>
          <li>Browser overlay: {flags.browserOverlay ? "on" : "off"}</li>
          <li>Email and SMS: {flags.emailDelivery || flags.smsDelivery ? "on" : "off"}</li>
        </ul>
      </section>
    </main>
  );
}
