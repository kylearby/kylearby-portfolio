"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { site } from "@/lib/site";
import { GlitchText } from "@/components/ui/GlitchText";
import { ShuffleTitle } from "@/components/ui/ShuffleTitle";
import { FragmentPortrait } from "@/components/ui/FragmentPortrait";
import { EASE_OUT_EXPO } from "@/lib/motion";

/**
 * HERO
 * "Hello, I'm Kyle" — the name set to match the wordmark and carrying the
 * site's glitch burst — followed by "I'm a <cycling title>". The fragmenting
 * halftone portrait sits opposite it on the grid. The full lockup moved to
 * the header; the plain headshot lives in About.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const lift = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);

  const line = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE_OUT_EXPO },
  });

  // Sized to fill its seven-column measure rather than to a type-scale step:
  // 8.7vw puts "Hello, I'm Kyle" at ~96% of the column, and the 8.7rem cap
  // freezes it once the shell stops growing at its 100rem max — past that a
  // pure vw value would keep growing and overrun the column. The 2.75rem
  // floor is the old `text-display` minimum, so mobile is unchanged.
  //
  // Tracking and line-height are spelled out because a bare `text-[...]`
  // utility carries neither, and the display scale's own -0.045em is what
  // keeps the line this tight.
  const headlineTypeClass =
    "font-display text-[clamp(2.75rem,8.7vw,8.7rem)] leading-none tracking-[-0.045em]";

  // Shared with the role line below, so the two rows of large type match
  // exactly rather than two independently-tuned sizes that only look close.
  const roleTypeClass =
    "font-display text-[clamp(1.5rem,3.4vw,3rem)] font-medium leading-[1.1] tracking-[-0.04em]";

  // The greeting row that used to sit above the headline is gone, so the
  // section no longer has two children to space apart — it is one centred
  // block now. Top padding only has to clear the fixed header; the large gap
  // that used to sit above the portrait came from the old `py-12` plus the
  // centring, not from the section padding, so that is where the reduction is.
  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-dvh flex-col justify-center pb-10 pt-24 md:pb-12 md:pt-24"
    >
      <motion.div
        style={reduce ? undefined : { opacity: fade, y: lift }}
        className="u-shell relative z-10 py-2"
      >
        <div className="u-grid items-end gap-y-12">
          <div className="col-span-6 md:col-span-7">
            {/* Real text now rather than the logo mask, so the h1 carries its
                own accessible name and no sr-only duplicate is needed. */}
            <motion.h1 {...line(0.3)} className={headlineTypeClass}>
              {/* Both halves are full-strength white now; weight alone
                  separates the greeting from the name. */}
              <span className="font-medium text-fg">
                {site.hero.greetingLead}{" "}
              </span>
              {/* Set to match the wordmark — same family, same weight, same
                  tracking — rather than reusing the logo artwork itself: the
                  mask is a single "Kyle Arby" image with no separable "Kyle",
                  and the glitch burst works on text, not on a mask. */}
              <GlitchText
                text={site.hero.firstName}
                as="span"
                className="font-bold text-fg"
              />
            </motion.h1>

            {/* `leading-none` above means the "y" of "Kyle" hangs ~0.15em
                past the heading's box, so this margin is measured from that
                overhang, not from the box edge — mt-4 leaves a real gap of
                roughly 6px between descender and cap. */}
            <motion.p {...line(0.45)} className={`mt-4 ${roleTypeClass}`}>
              <ShuffleTitle
                titles={site.titles}
                interval={2200}
                connector={site.hero.connector}
                connectorClassName="text-fg-subtle"
              />
            </motion.p>
          </div>

          {/* Widened from 4 columns to 5 — the portrait fills its column, so
              the column is the only thing that sets its size. */}
          <motion.div
            {...line(0.55)}
            className="col-span-6 md:col-span-5 md:col-start-8"
          >
            <FragmentPortrait />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
