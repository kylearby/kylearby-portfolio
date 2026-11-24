import type { Metadata } from "next";
import { EnterForm } from "@/components/chrome/EnterForm";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  // `absolute` so the root layout's "%s — Kyle Arby" template does not
  // append the name a second time.
  title: { absolute: "Private preview — Kyle Arby" },
  // Belt and braces with the middleware's X-Robots-Tag header.
  robots: { index: false, follow: false },
};

/**
 * The gate's face. Middleware rewrites every unauthenticated request here, so
 * this renders under whatever URL was asked for — the address bar still shows
 * the page the visitor wanted, and they land on it once they are through.
 */
export default function EnterPage() {
  return (
    <main className="flex min-h-dvh flex-col justify-between px-gutter py-10 md:py-14">
      <Logo variant="lockup" className="w-[132px] md:w-[152px]" />

      <div className="max-w-[42ch]">
        <p className="u-mono text-accent">Private preview</p>
        <h1 className="mt-4 font-display text-[clamp(2rem,5.2vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.04em]">
          This site isn&apos;t finished yet.
        </h1>
        <p className="mt-5 text-lede text-fg-muted">
          The work is still going in. If you were given a password, enter it
          below.
        </p>

        <EnterForm />
      </div>

      <p className="u-mono text-fg-subtle">
        {new Date().getFullYear()} — Kyle Arby Santos
      </p>
    </main>
  );
}
