"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { useReducedMotion } from "framer-motion";
import { GlitchWord } from "@/components/ui/GlitchWord";

/** Kept in step with the marquee's own burst length. */
const BURST_MS = 620;

/**
 * GLITCH TEXT
 * ---------------------------------------------------------------------------
 * Prose that answers a hover or a tap with the marquee's own gesture: one
 * word tears into its blue and red separations, screen-composites back
 * toward white, and settles. No colour shift, no scale — the burst is the
 * only feedback, same as the marquee band.
 *
 * Colour and blending are the caller's, passed through `className` — this
 * component owns the interaction, not the look. The About overlay sets
 * `text-paper mix-blend-difference` on top of the photograph; the stats band
 * just sets `text-accent` and blends with nothing. Setting a blend mode here
 * would apply it to the paragraph as a whole, which composites base text and
 * mid-burst word as one isolated group before blending — correct for the
 * overlay, wrong anywhere the caller wants the burst to hit the background
 * directly, as the marquee does.
 *
 * `\n` in `text` breaks it into hard lines rather than letting it reflow —
 * for a short, art-directed headline like this one the line break is a
 * layout decision, not something to leave to the viewport. `lineClassName`
 * lets the caller offset individual lines (a staggered second line, say)
 * without that positioning leaking into the word-glitch logic below, which
 * runs on one flat, cross-line word index so hover/tap targeting doesn't
 * care where a line break happens to fall.
 *
 * Two input paths, same split as the rest of the site's pointer-aware text:
 *  - mouse → pointerenter fires the burst once per hover-in
 *  - touch → no hover to catch a finger, so a tap fires it directly
 */
export function GlitchText({
  text,
  as = "p",
  className = "",
  lineClassName = [],
}: {
  text: string;
  as?: ElementType;
  className?: string;
  /** Extra classes per line, indexed by position after splitting on `\n`. */
  lineClassName?: string[];
}) {
  const reduce = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const clearRef = useRef<number | null>(null);
  const Tag = as as ElementType;
  const lines = text.split("\n");

  useEffect(() => {
    return () => {
      if (clearRef.current) window.clearTimeout(clearRef.current);
    };
  }, []);

  // The burst is motion with no static equivalent — like the headshot's
  // fragmentation, there is nothing left to show once the tear is removed —
  // so reduced motion drops the interaction rather than substituting one.
  const trigger = (i: number) => {
    if (reduce) return;
    if (clearRef.current) window.clearTimeout(clearRef.current);
    setActiveIndex(i);
    clearRef.current = window.setTimeout(() => setActiveIndex(null), BURST_MS);
  };

  const onEnter = (i: number) => (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") trigger(i);
  };
  const onDown = (i: number) => (e: React.PointerEvent) => {
    if (e.pointerType === "touch") trigger(i);
  };

  // A running index across every line, not per-line, so each word still gets
  // a stable, unique target regardless of which line it landed on.
  let wordIndex = 0;

  return (
    <Tag className={className}>
      {lines.map((line, li) => {
        const words = line.split(" ");
        return (
          // `block` only when there is more than one line to separate. A
          // single-line instance is often set inline inside a larger
          // sentence — the hero's "Kyle" sits mid-headline — and a block
          // wrapper there would force its own line.
          <span
            key={li}
            className={`${lines.length > 1 ? "block" : ""} ${lineClassName[li] ?? ""}`}
          >
            {words.map((word, wi) => {
              const i = wordIndex++;
              return (
                <span key={`${word}-${i}`}>
                  {/* Only the word itself re-enables hit-testing. The
                      paragraph's own pointer-events stay whatever the caller
                      set (typically none, so the photo underneath keeps
                      receiving the hover it needs for its own reveal) — the
                      glitch is a per-word target, not a block one. */}
                  <span
                    onPointerEnter={onEnter(i)}
                    onPointerDown={onDown(i)}
                    className="pointer-events-auto inline-block"
                  >
                    <GlitchWord word={word} active={activeIndex === i} duration={BURST_MS} />
                  </span>
                  {wi < words.length - 1 ? " " : null}
                </span>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}
