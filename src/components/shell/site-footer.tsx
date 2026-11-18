import Link from "next/link";

export function SiteFooter({
  note,
  limits,
  editor,
  account,
}: {
  note: string;
  limits: string;
  editor: string;
  account: string;
}) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-base text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl">{note}</p>
        <nav aria-label="More" className="flex flex-wrap gap-x-4 gap-y-2 font-semibold text-ink">
          <Link className="underline decoration-line underline-offset-4" href="/limits">
            {limits}
          </Link>
          <Link className="underline decoration-line underline-offset-4" href="/account">
            {account}
          </Link>
          <Link className="underline decoration-line underline-offset-4" href="/editor">
            {editor}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
