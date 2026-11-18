import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { readSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { t } from "@/lib/i18n/messages";

export default async function NotFound() {
  const user = await readSessionUser(getDb());
  const copy = t(user?.locale);
  return (
    <main id="main" className="mx-auto flex w-full max-w-3xl flex-col px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-deep">404</p>
      <h1 className="mt-3 font-display text-5xl tracking-tight text-ink">{copy.notFoundTitle}</h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-muted">{copy.notFoundBody}</p>
      <Link href="/" className={`${buttonClass("primary")} mt-8 w-fit`}>
        {copy.backHome}
      </Link>
    </main>
  );
}
