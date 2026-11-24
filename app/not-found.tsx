import Link from "next/link";
import { ArrowLeft } from "@/components/ui/Icons";

export default function NotFound() {
  return (
    <section className="u-shell flex min-h-[70vh] flex-col justify-center py-section">
      <p className="u-meta text-accent">404</p>
      <h1 className="mt-4 font-display text-headline font-medium">
        Nothing filed here.
      </h1>
      <p className="mt-5 max-w-[40ch] text-lede text-fg-muted">
        The page you were looking for has moved, or never existed. The index is
        still where you left it.
      </p>
      <Link
        href="/"
        className="group/back mt-10 inline-flex w-fit items-center gap-3 border-b border-line pb-2 text-fg transition-colors hover:border-accent hover:text-accent"
      >
        <ArrowLeft
          size={18}
          className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover/back:-translate-x-1"
        />
        <span className="u-meta">Back to the index</span>
      </Link>
    </section>
  );
}
