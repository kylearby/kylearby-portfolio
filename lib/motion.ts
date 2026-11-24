import type { Transition, Variants } from "framer-motion";

/**
 * MOTION TOKENS
 * One rhythm for the whole site. Every animation borrows from here so the
 * page reads as a single choreography rather than a pile of effects.
 */

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT_QUART = [0.76, 0, 0.24, 1] as const;

export const DURATION = {
  micro: 0.18,
  fast: 0.32,
  base: 0.6,
  slow: 0.9,
  reveal: 1.1,
} as const;

/** Enter transition used by nearly everything. */
export const enter: Transition = {
  duration: DURATION.base,
  ease: EASE_OUT_EXPO,
};

/** Exits run shorter than entrances so dismissal feels responsive. */
export const exit: Transition = {
  duration: DURATION.fast,
  ease: EASE_IN_OUT_QUART,
};

/** Standard viewport trigger — fires once, slightly before the element lands. */
export const viewportOnce = { once: true, amount: 0.25, margin: "0px 0px -12% 0px" };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: enter },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: enter },
};

/** Container that staggers its children at the Material-recommended cadence. */
export const stagger = (delayChildren = 0, staggerChildren = 0.06): Variants => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
});

/** Word/line reveal — masked, so text rises out of a clean edge. */
export const riseLine: Variants = {
  hidden: { y: "110%" },
  show: {
    y: "0%",
    transition: { duration: DURATION.reveal, ease: EASE_OUT_EXPO },
  },
};

/** Image reveal — the frame opens, the picture settles back to rest. */
export const imageClip: Variants = {
  hidden: { clipPath: "inset(0 0 100% 0)", scale: 1.16 },
  show: {
    clipPath: "inset(0 0 0% 0)",
    scale: 1,
    transition: { duration: 1.25, ease: EASE_OUT_EXPO },
  },
};
