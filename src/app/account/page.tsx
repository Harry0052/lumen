import { buttonClass } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { readSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { errorText, noticeText, t } from "@/lib/i18n/messages";

export const metadata = { title: "Your data" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const params = await searchParams;
  const user = await readSessionUser(getDb());
  const locale = user?.locale ?? "en";
  const copy = t(locale);
  const message = noticeText(locale, params.notice) ?? errorText(locale, params.error);

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="font-display text-5xl tracking-tight text-ink">{copy.accountTitle}</h1>
      <p className="mt-4 text-xl leading-9">{copy.accountLead}</p>
      {message ? (
        <p role="status" className="mt-4 rounded-2xl bg-good-bg px-4 py-3 font-semibold">
          {message}
        </p>
      ) : null}
      {!user ? <p className="mt-6 text-lg">{copy.noAccount}</p> : null}
      <form method="post" action="/api/preferences" className="mt-8 space-y-4">
        <input type="hidden" name="intent" value="name" />
        <input type="hidden" name="returnTo" value="/account" />
        <Field id="display-name" label={copy.nameLabel} error={params.error === "short_name" ? message : null}>
          <input
            id="display-name"
            name="displayName"
            defaultValue={user?.displayName ?? ""}
            maxLength={40}
            autoComplete="nickname"
            aria-invalid={params.error === "short_name"}
            aria-describedby={params.error === "short_name" ? "display-name-error" : undefined}
            className={inputClass}
          />
        </Field>
        <button type="submit" className={buttonClass("primary")}>
          {copy.saveName}
        </button>
      </form>
      <section className="mt-10 rounded-card border border-line bg-card p-5">
        <h2 className="text-2xl font-semibold">{copy.exportData}</h2>
        <p className="mt-2 text-lg">{copy.exportNote}</p>
        <a href="/api/account/export" className={`${buttonClass("secondary")} mt-4`}>
          {copy.exportData}
        </a>
      </section>
      <section className="mt-6 rounded-card border border-caution bg-caution-bg p-5">
        <h2 className="text-2xl font-semibold">{copy.deleteData}</h2>
        <p className="mt-2 text-lg">{copy.deleteHint}</p>
        <form method="post" action="/api/account/delete" className="mt-4 space-y-3">
          <Field id="delete-confirm" label={copy.deleteConfirmLabel}>
            <input id="delete-confirm" name="confirm" className={inputClass} autoComplete="off" />
          </Field>
          <button type="submit" className={buttonClass("danger")}>
            {copy.deleteData}
          </button>
        </form>
      </section>
    </main>
  );
}
