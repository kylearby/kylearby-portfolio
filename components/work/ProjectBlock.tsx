"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { Project } from "@/lib/projects";
import { blockFor } from "@/lib/projects";
import { EASE_OUT_EXPO, viewportOnce } from "@/lib/motion";

/**
 * PROJECT BLOCK
 * A project as a full-bleed field of colour. The colour comes from position in
 * the list (see `blockFor`), and the text colour that rides on it is the one
 * that clears AA on that fill — not a per-block style choice.
 *
 * The block itself is the link: one tab stop, one target, and a hit area the
 * size of the viewport.
 *
 * Within a <ProjectStack> the block also behaves as one card of a sticky
 * stack: it pins under the header, then shrinks and lifts as later cards land
 * on top, leaving its top edge showing above them.
 */

/** How much a card shrinks for each later card stacked on top of it. */
const SCALE_STEP = 0.02;
/** How far, in px, it lifts per stacked card — this is the visible edge. */
const RISE_STEP = 28;
/**
 * Depth is capped so the lifted edges stay under the header instead of
 * marching off the top of the screen. Past this the card simply holds; a
 * stack this deep reads as "several" either way, and the alternative is
 * either a taller header offset or edges that disappear.
 */
const MAX_DEPTH = 3;

export function ProjectBlock({
  project,
  index,
  total,
  progress,
}: {
  project: Project;
  index: number;
  /** Number of cards in the stack. */
  total: number;
  /** The stack container's scroll progress, 0→1. */
  progress: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  const block = blockFor(index);

  // How many later cards have landed on this one. Progress runs 0→1 across
  // the container, which holds `total` cards plus one trailing slot, so
  // scaling by `total` converts progress into "cards scrolled past" and
  // subtracting the index makes it relative to when this card pins.
  // Negative means it has not been reached yet.
  //
  // The ceiling is the smaller of MAX_DEPTH and the number of cards that
  // actually come after this one — a card cannot be buried by cards that do
  // not exist. Without the second term the progress mapping overshoots at the
  // very end of the scroll and the last card, which nothing ever covers,
  // shrank a step on its own.
  const maxDepth = Math.min(MAX_DEPTH, total - 1 - index);
  const depth = useTransform(progress, (v) =>
    Math.min(maxDepth, Math.max(0, v * total - index))
  );
  const scale = useTransform(depth, (d) => 1 - d * SCALE_STEP);
  const y = useTransform(depth, (d) => -d * RISE_STEP);

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={viewportOnce}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
      style={{
        backgroundColor: block.bg,
        color: block.fg,
        // Sticky is layout, not animation, so it stays under reduced motion —
        // the cards still stack, they just do not shrink or lift on the way.
        ...(reduce ? {} : { scale, y }),
      }}
      // `origin-top`: with the default centre origin, shrinking pushes the
      // card's top edge back down by half the height it loses, which cancelled
      // most of the lift — 28px of rise was landing as a 16px edge. Anchored
      // to the top, the card shrinks away from its pinned edge instead, so
      // RISE_STEP is exactly the visible sliver.
      //
      // The pin offset is not a taste value: it has to clear the fixed header
      // *plus* the full height the stack lifts into (MAX_DEPTH × RISE_STEP =
      // 84px). Any less and the risen edges slide up behind the header, where
      // its backdrop-blur turns them to mud — the stack is only worth having
      // if you can see the edges.
      //
      // The card height is tied to the same offset so a pinned card still
      // fits between the header and the bottom of the screen; otherwise its
      // footer row (summary, "view project") sits below the fold for the
      // whole time the card is the one being read.
      // One offset at every breakpoint, not a smaller one for phones: the
      // header is ~75px tall on both, and the stack lifts the same 84px on
      // both, so the clearance it has to buy is the same. The mobile-specific
      // 132px looked safe and was not — it put the topmost edges at 48px,
      // behind the header.
      className="
        u-grain sticky top-[168px] min-h-[calc(100dvh-188px)] w-full
        origin-top overflow-hidden
      "
    >
      <Link
        href={`/work/${project.slug}`}
        data-cursor="View"
        aria-label={`${project.client} — ${project.title}, ${project.year}. View project.`}
        className="group/block relative block focus-visible:outline-none"
      >
        {/* The card's height now comes from the article above (it is tied to
            the sticky offset), so this inherits it rather than declaring a
            second, competing one. */}
        <div className="u-shell flex min-h-[inherit] flex-col justify-between py-12 md:py-16">
          {/* Ledger row */}
          <div
            className="flex items-baseline justify-between gap-4 border-t pt-4"
            style={{ borderColor: block.rule }}
          >
            <time className="u-mono tabular" dateTime={project.year.slice(0, 4)}>
              {project.year}
            </time>
            <span className="u-mono lowercase">{project.category}</span>
            <span className="u-mono tabular ml-auto opacity-70">
              {project.index}
            </span>
          </div>

          {/* Name */}
          <div className="mt-16">
            <motion.h3
              initial={reduce ? false : { y: 26, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={viewportOnce}
              transition={{ duration: 0.85, ease: EASE_OUT_EXPO }}
              className="
                font-display text-block font-medium lowercase
                transition-transform duration-[700ms]
                ease-[cubic-bezier(0.16,1,0.3,1)]
                motion-safe:group-hover/block:translate-x-2
              "
            >
              {project.client}
              <span className="opacity-45"> — </span>
              {project.title}
            </motion.h3>

            <div
              className="mt-6 flex flex-wrap items-end justify-between gap-6 border-t pt-4"
              style={{ borderColor: block.rule }}
            >
              <p className="u-mono max-w-[54ch] opacity-80">{project.summary}</p>
              <span
                className="
                  u-mono inline-flex shrink-0 items-center gap-2
                  transition-transform duration-[600ms]
                  ease-[cubic-bezier(0.16,1,0.3,1)]
                  motion-safe:group-hover/block:translate-x-1
                  motion-safe:group-focus-visible/block:translate-x-1
                "
              >
                view project
                <span aria-hidden="true">↗</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
