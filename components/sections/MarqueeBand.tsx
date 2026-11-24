import { Marquee } from "@/components/ui/Marquee";

const WORDS = [
  "Brand Systems",
  "Art Direction",
  "Packaging",
  "Environments",
  "Typography",
  "Campaigns",
  "Retail",
  "Motion",
];

/**
 * Typographic band between sections. Two tracks at different speeds and
 * directions, which reads as texture rather than as a ticker. Both are
 * draggable, and both periodically misregister a word into its blue and red
 * separations — the hero portrait's tear, on a timer instead of a pointer.
 */
export function MarqueeBand() {
  return (
    <section
      aria-label="Disciplines"
      className="u-fade-x overflow-hidden border-y border-line py-10 md:py-14"
    >
      <Marquee
        items={WORDS}
        speed={46}
        className="font-display text-[clamp(2.25rem,6vw,4.5rem)] font-medium leading-none tracking-[-0.04em]"
      />
      <Marquee
        items={WORDS}
        speed={61}
        reverse
        className="mt-3 font-display text-[clamp(2.25rem,6vw,4.5rem)] font-medium leading-none tracking-[-0.04em] text-fg-subtle"
      />
    </section>
  );
}
