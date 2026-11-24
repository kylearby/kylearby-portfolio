"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ElementType } from "react";
import { EASE_OUT_EXPO, viewportOnce } from "@/lib/motion";

type SplitTextProps = {
  text: string;
  className?: string;
  as?: ElementType;
  delay?: number;
  /** Seconds between each word. */
  stagger?: number;
  /** Play immediately instead of waiting for the scroll trigger. */
  immediate?: boolean;
};

/**
 * Staggered word reveal. Each word sits in an overflow-hidden mask and rises
 * into place, so the text appears to be printed rather than faded in.
 *
 * The full string is exposed via aria-label and the per-word markup is hidden,
 * so assistive tech reads one clean sentence.
 */
export function SplitText({
  text,
  className = "",
  as = "span",
  delay = 0,
  stagger = 0.055,
  immediate = false,
}: SplitTextProps) {
  const reduce = useReducedMotion();
  const Tag = as as ElementType;
  const words = text.split(" ");

  if (reduce) {
    return <Tag className={className}>{text}</Tag>;
  }

  const MotionTag = motion[as as keyof typeof motion] as typeof motion.span;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      {...(immediate
        ? { animate: "show" }
        : { whileInView: "show", viewport: viewportOnce })}
      variants={{
        hidden: {},
        show: { transition: { delayChildren: delay, staggerChildren: stagger } },
      }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} aria-hidden="true">
          <span
            className="inline-block overflow-hidden align-bottom"
            // Descenders in Satoshi reach ~0.22em below the baseline, so the
            // mask needs more room than that or display-size text gets its
            // tails sliced off. The negative margin cancels the visual effect.
            style={{ paddingBottom: "0.28em", marginBottom: "-0.28em" }}
          >
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "112%" },
                show: { y: "0%", transition: { duration: 1, ease: EASE_OUT_EXPO } },
              }}
            >
              {word}
            </motion.span>
          </span>
          {/* Word space sits outside the mask, where it cannot be collapsed. */}
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </MotionTag>
  );
}
