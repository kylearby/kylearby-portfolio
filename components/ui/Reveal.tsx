"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import { DURATION, EASE_OUT_EXPO, viewportOnce } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  /** Vertical travel in px. Set 0 for a pure fade. */
  y?: number;
  delay?: number;
  duration?: number;
  className?: string;
  as?: ElementType;
  /** Stagger children instead of animating this element itself. */
  stagger?: number;
};

/**
 * Fade-up on scroll. The workhorse reveal for the whole page.
 * Under prefers-reduced-motion the content is simply present — no travel,
 * no opacity ramp, nothing to wait for.
 */
export function Reveal({
  children,
  y = 24,
  delay = 0,
  duration = DURATION.base,
  className,
  as = "div",
  stagger,
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  if (reduce) {
    const Tag = as as ElementType;
    return <Tag className={className}>{children}</Tag>;
  }

  const variants: Variants = stagger
    ? {
        hidden: {},
        show: { transition: { delayChildren: delay, staggerChildren: stagger } },
      }
    : {
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration, delay, ease: EASE_OUT_EXPO },
        },
      };

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {children}
    </MotionTag>
  );
}

/** A single item inside a <Reveal stagger>. */
export function RevealItem({
  children,
  className,
  y = 20,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  as?: ElementType;
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  if (reduce) {
    const Tag = as as ElementType;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: DURATION.base, ease: EASE_OUT_EXPO },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}

/** Hairline rule that draws itself left-to-right as it enters. */
export function RevealRule({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={`u-rule ${className}`} aria-hidden="true" />;

  return (
    <motion.div
      aria-hidden="true"
      className={`u-rule ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={viewportOnce}
      transition={{ duration: 1, ease: EASE_OUT_EXPO }}
    />
  );
}
