"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Reading-progress hairline pinned to the top of the viewport.
 * Transform-only, so it never triggers layout.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[100] h-[2px] origin-left bg-accent"
    />
  );
}
