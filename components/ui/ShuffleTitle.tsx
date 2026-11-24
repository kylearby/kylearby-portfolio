"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { EASE_OUT_EXPO } from "@/lib/motion";

/** "an Industrial Designer" but "a Graphic Designer". */
const articleFor = (word: string) =>
  /^[aeiou]/i.test(word.trim()) ? "an" : "a";

/**
 * Word (or short phrase) that rolls vertically through a list.
 *
 * The live region is polite and only the current entry is exposed, so a
 * screen reader is not interrupted every few seconds. Under reduced motion
 * the list stops rotating and the first entry stands as the definitive one —
 * a rotating label is exactly the kind of unrequested movement that setting
 * rules out.
 */
/**
 * How far below the mask a queued title waits. Must exceed 100% by at
 * least the wrapper's descender bleed (0.3em) expressed as a share of the
 * line box, or the next word peeks out beneath the current one.
 */
const ENTER_FROM = "140%";

export function ShuffleTitle({
  titles,
  interval = 1700,
  className = "",
  connector,
  connectorClassName = "",
  withArticle = true,
}: {
  titles: readonly string[];
  /** Milliseconds each title holds before the next rolls up. */
  interval?: number;
  className?: string;
  /** Leading words, e.g. "is" or "This is my". */
  connector?: string;
  connectorClassName?: string;
  /**
   * When true (the default), an indefinite article is inserted and agreed
   * with whichever entry is on screen, so a role connector reads "is a
   * Graphic Designer" rather than "is Graphic Designer". Set false for
   * connectors that already read correctly with no article — "This is my
   * website" needs no "a" the way "is a Graphic Designer" does.
   */
  withArticle?: boolean;
}) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce || titles.length < 2) return;
    const id = window.setInterval(
      () => setI((n) => (n + 1) % titles.length),
      interval
    );
    return () => window.clearInterval(id);
  }, [reduce, titles.length, interval]);

  const current = titles[i] ?? "";
  const first = titles[0] ?? "";

  const lead = connector ? (
    <span className={connectorClassName}>{connector} </span>
  ) : null;

  if (reduce) {
    return (
      <span className={className}>
        {lead}
        {connector && withArticle ? (
          <span className={connectorClassName}>{articleFor(first)} </span>
        ) : null}
        {first}
      </span>
    );
  }

  return (
    <span className={`inline ${className}`}>
      {lead}
      <span
        className="relative inline-flex overflow-hidden align-bottom"
        // Descenders reach ~0.22em past the baseline; without this bleed the
        // mask edge crops the tails of g/y at display sizes.
        style={{ paddingBottom: "0.3em", marginBottom: "-0.3em" }}
      >
        {/* Reserves the width of the widest variant so the line never reflows
            mid-roll. Every title is stacked in a single grid cell rather than
            picking the longest string — character count is a poor proxy for
            rendered width in a proportional face with negative tracking. The
            article is included so "an" never overflows the reserved box. */}
        <span aria-hidden="true" className="invisible grid">
          {titles.map((t) => (
            <span key={t} className="col-start-1 row-start-1 whitespace-nowrap">
              {connector && withArticle ? `${articleFor(t)} ` : ""}
              {t}
            </span>
          ))}
        </span>

        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={current}
            // Enters from below the *bleed*, not just below the box. The
            // wrapper above adds 0.3em of bottom padding so descenders are
            // not cropped, and overflow clips at the padding edge — so the
            // visible region is taller than the element. Parked at the old
            // 105% the incoming title's top sat 6px inside that region and
            // showed as a sliver of the next word under the current one.
            // Clearing it needs 100% + 0.3em/line-height, which is 127% at
            // this leading; 140% measured clean with 3px to spare and still
            // covers a line-height of 1.0.
            initial={{ y: ENTER_FROM }}
            animate={{ y: "0%" }}
            exit={{
              y: "-105%",
              transition: { duration: 0.26, ease: [0.76, 0, 0.24, 1] },
            }}
            transition={{ duration: 0.42, ease: EASE_OUT_EXPO }}
            className="absolute inset-x-0 top-0 whitespace-nowrap"
          >
            {/* The article rides inside the keyed element rather than reading
                the current index. AnimatePresence keeps the outgoing word
                mounted through its exit, so an index-driven article would
                disagree with what is on screen for every transition. */}
            {connector && withArticle ? (
              <span className={connectorClassName}>
                {articleFor(current)}{" "}
              </span>
            ) : null}
            {current}
          </motion.span>
        </AnimatePresence>

        <span className="sr-only" aria-live="polite">
          {current}
        </span>
      </span>
    </span>
  );
}
