import { bio, stats } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { GlitchText } from "@/components/ui/GlitchText";
import { DatamoshPortrait } from "@/components/ui/DatamoshPortrait";

export function About() {
  return (
    <section id="about" className="u-shell scroll-mt-24 py-section">
      <SectionHeader index="02" title="About" />

      <div className="u-grid gap-y-16">
        {/* LEFT — portrait, statement blown up and run across the whole
            column rather than caged to the photo underneath it.
            `self-start`: a grid item stretches to the row's height by
            default, and this row's height is set by the much taller
            Experience column opposite it — without this the box (and the
            `items-end` text inside it) would bottom-anchor against that
            far-off height instead of against the portrait actually in it. */}
        <div className="relative col-span-6 self-start md:col-span-6">
          {/* Speaks the hero portrait's language — banded shear, chromatic
              separation — but on the real photograph rather than the halftone
              duotone. 40% larger than the old side-by-side crop. */}
          <Reveal delay={0.05} className="mb-10 max-w-md">
            <DatamoshPortrait />
          </Reveal>

          {/* Positioned against the whole column, not the photo, so the
              statement can overrun the image's right edge and fill the rest
              of the column — it only stops where the grid gap meets the
              Experience column starting. `top-0 bottom-10` (rather than
              `inset-0`) scopes the box to the photo's own rendered height,
              excluding the `mb-10` gap below it, so the anchor below lands
              against the actual photo instead of against a box that's 40px
              taller than the image it's meant to read against. Pointer-events
              off on the wrapper so the photo underneath keeps receiving the
              hover it needs for its own reveal; each word opts back in
              individually, so only the type is a glitch target and the rest
              of the frame stays the portrait's. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-10">
            {/* `top-[54%]`, not `padding-top` on the flex box above — vertical
                padding percentages resolve against the containing block's
                *width* per the CSS spec, not its height, which is a subtle
                enough trap that it shipped once already: it happened to look
                right on a wide desktop column and put the text across the
                face on a narrower one, because the "same" percentage was
                actually measuring two different things. `top` percentages on
                an absolutely positioned box are defined against height, so
                one value now holds correctly at every column width instead
                of needing a breakpoint patch underneath it. */}
            <div className="absolute inset-x-0 top-[54%]">
              <GlitchText
                text={bio[0]}
                as="p"
                // Matches the work-card title size (`text-block`) per the
                // brief — the biggest type on the page outside the hero, now
                // doubled up here. The second line's `ml-[1.4em]` is the
                // "offset for style": it scales with the clamp, so the
                // stagger holds its proportion at every size rather than a
                // fixed px value that would read as barely-there on mobile
                // and huge on a monitor.
                // `text-paper mix-blend-difference` lives here rather than
                // inside GlitchText: a literal white differenced against the
                // photo is what keeps this legible in both themes, and it is
                // this caller's requirement, not the component's.
                className="font-display text-block font-medium leading-[0.98] text-paper mix-blend-difference"
                lineClassName={["", "ml-[1.4em]"]}
              />
            </div>
          </div>
        </div>

        {/* STATS — beside the portrait rather than beneath it, so the whole
            section reads as one row. Sharing the row means the cells lose
            roughly half their width, so the padding between them is tighter
            here than a full-width band would want; `self-center` sits the
            cluster against the middle of the portrait instead of letting the
            grid stretch it over the portrait's full height. */}
        <div className="col-span-6 self-center md:col-span-6 md:col-start-7">
          <Reveal
            stagger={0.1}
            className="grid grid-cols-1 border-y border-line sm:grid-cols-3"
          >
            {stats.map((stat, i) => (
              <RevealItem
                key={stat.figure}
                as="div"
                // No vertical rules between columns — the gap does the
                // separating. The horizontal rule stays on the stacked
                // layout, where columns sit on top of each other and there
                // is no gutter to read as a break.
                className={`
                  py-8 md:py-10
                  ${i > 0 ? "border-t border-line sm:border-t-0 sm:pl-5 md:pl-7" : ""}
                  ${i < stats.length - 1 ? "sm:pr-5 md:pr-7" : ""}
                `}
              >
                {/* The figure is the glitch target — same burst as the
                    marquee and the overlay statement. No blend mode here:
                    the channels screen straight onto the page ground, which
                    is exactly what the marquee does. */}
                <GlitchText
                  text={stat.figure}
                  as="p"
                  className="font-display text-block font-bold text-accent"
                />
                {/* Uppercase and tracked to match the reference, but set in
                    the mono face so the label still belongs to this site's
                    label system rather than importing a second one.

                    Spelled out rather than composed from `u-meta`: that class
                    sets `text-transform: none` and its own letter-spacing, and
                    since bare Tailwind utilities all share one specificity the
                    winner is decided by emit order, not by JSX order — so
                    `u-meta uppercase tracking-[0.14em]` silently rendered as
                    neither uppercase nor tracked. Explicit values cannot tie. */}
                <h3 className="mt-6 font-mono text-[0.8125rem] uppercase tracking-[0.14em] text-fg">
                  {stat.label}
                </h3>
                <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-fg-muted">
                  {stat.note}
                </p>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
