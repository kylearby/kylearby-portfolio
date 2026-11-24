import type { ReactNode } from "react";
import { Reveal, RevealRule } from "@/components/ui/Reveal";

/**
 * Shared section masthead: index, title, and an optional note on the right.
 * Every section opens the same way, which is what makes the page read as one
 * document rather than a stack of blocks.
 */
export function SectionHeader({
  index,
  title,
  note,
  id,
}: {
  index: string;
  title: string;
  note?: ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-12 md:mb-20">
      <RevealRule className="mb-5" />
      <Reveal className="u-grid items-baseline gap-y-3" stagger={0.07}>
        {/* The eyebrow is the section's real heading. It is set small, but it
            is what gives the page a clean h1 → h2 → h3 outline. */}
        <h2 className="u-meta col-span-6 text-fg-subtle md:col-span-3">
          <span className="text-accent">{index}</span> — {title}
        </h2>
        {note && (
          <div
            id={id}
            className="col-span-6 max-w-[52ch] text-lede text-fg md:col-span-6 md:col-start-5"
          >
            {note}
          </div>
        )}
      </Reveal>
    </div>
  );
}
