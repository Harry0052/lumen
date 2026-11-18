import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { shellNav } from "@/components/shell/nav";
import { PrimaryNav } from "@/components/shell/primary-nav";
import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { readSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { t } from "@/lib/i18n/messages";
import "./globals.css";

const source = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: {
    default: "Lumen",
    template: "%s · Lumen",
  },
  description: "Lumen explains a few everyday internet tasks in plain language, one step at a time. It does not fill in forms or sign in for you.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await readSessionUser(getDb());
  const locale = user?.locale ?? "en";
  const copy = t(locale);
  const items = shellNav({
    help: copy.navHelp,
    progress: copy.navProgress,
    saved: copy.navSaved,
    access: copy.navAccess,
  });

  return (
    <html
      lang={locale}
      data-scale={user?.textScale ?? "1"}
      data-contrast={user?.contrast ?? "standard"}
      data-motion={user?.reducedMotion ? "reduce" : "off"}
      className={`${source.variable} ${fraunces.variable} h-full`}
    >
      <body className="flex min-h-full flex-col pb-24 font-sans text-ink antialiased lg:pb-0">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          {copy.skip}
        </a>
        <SiteHeader
          displayName={user?.displayName ? user.displayName : copy.notNamed}
          locale={locale}
          items={items}
          languageLabel={copy.languageLabel}
          english={copy.english}
          spanish={copy.spanish}
        />
        <div className="flex-1">{children}</div>
        <SiteFooter note={copy.footerNote} limits={copy.footerLimits} editor={copy.footerEditor} account={copy.footerAccount} />
        <PrimaryNav items={items} variant="mobile" />
      </body>
    </html>
  );
}
