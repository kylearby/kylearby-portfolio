"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useEffect, useState } from "react";

/**
 * CROSSHAIR CURSOR
 * ---------------------------------------------------------------------------
 * A translucent registration mark rather than a blob: four arms around a gap,
 * so the exact pointer position stays visible through the middle. The
 * surrounding field is frosted — it blurs and lifts whatever it passes over.
 *
 * Three states, and the mark never changes shape between them:
 *  - at rest      → blue crosshair + red centre dot inside a small frosted disc
 *  - interactive  → arms extend, disc opens, label appears where one is set
 *  - grabbing     → mark goes solid white and switches to `mix-blend-mode:
 *                   difference`, inverting whatever colour sits under it —
 *                   the "you are now moving something" cue, without swapping
 *                   to a different icon.
 *
 * Motion: the arms track the pointer with no lag, because a lagging crosshair
 * would lie about where the click will land. Only the frosted field trails.
 *
 * Guards: fine pointers only, and it stands down completely under
 * prefers-reduced-motion, handing the system pointer back.
 */

/** The four crosshair arms, as offsets from the pointer point. */
const ARMS = [
  { key: "up", vertical: true, sign: -1 },
  { key: "down", vertical: true, sign: 1 },
  { key: "left", vertical: false, sign: -1 },
  { key: "right", vertical: false, sign: 1 },
] as const;

export function Cursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);
  const [grabbing, setGrabbing] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const fieldX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.55 });
  const fieldY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.55 });

  useEffect(() => {
    if (reduce) return;
    const fine = window.matchMedia("(pointer: fine)");
    const apply = () => setEnabled(fine.matches);
    apply();
    fine.addEventListener("change", apply);
    return () => fine.removeEventListener("change", apply);
  }, [reduce]);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("u-hide-cursor");
    return () => document.documentElement.classList.remove("u-hide-cursor");
  }, [enabled]);

  // Grab state lives on <html data-grabbing> — Logo3D and the marquee set it
  // directly on the DOM rather than through React, since neither of them
  // renders the cursor. A MutationObserver is the cheapest way to bridge
  // that back in without either component knowing this one exists.
  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    const sync = () => setGrabbing(html.hasAttribute("data-grabbing"));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(html, { attributes: true, attributeFilter: ["data-grabbing"] });
    return () => mo.disconnect();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };

    const onOver = (event: PointerEvent) => {
      const el = (event.target as HTMLElement | null)?.closest?.(
        'a, button, [role="button"], input, textarea, select, [data-cursor], [data-cursor-icon]'
      ) as HTMLElement | null;

      setHovering(Boolean(el));
      setLabel(el?.dataset?.cursor ?? null);
    };

    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  // A throw in progress keeps the mark extended even if a fast drag outruns
  // the pointer and `pointerover` lands on whatever is underneath.
  const active = hovering || Boolean(label) || grabbing;

  // Every value carries the same +5px growth so the mark scales uniformly
  // rather than changing shape: the arms take +2.5 each side, which widens the
  // total span by 5, and the field grows 5 across.
  const arm = (pressed ? 7 : active ? 15 : 10) + 2.5;
  const gap = pressed ? 3 : active ? 7 : 4.5;
  const fieldSize = (label ? 92 : active ? 56 : 30) + 5;

  const spring = { type: "spring" as const, stiffness: 380, damping: 30, mass: 0.5 };

  // True white rather than the theme foreground: `difference` only produces
  // a clean invert against a *literal* white, since difference(black, x) = x,
  // not 255-x. Using the fg token would mean no inversion at all in light
  // mode, where fg is black.
  const grabColor = "var(--paper)";

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[120]">
      {/* Frosted field. Lifts and blurs whatever sits behind it; inverts it
          instead while a drag is in progress. */}
      <motion.div
        style={{ x: fieldX, y: fieldY, mixBlendMode: grabbing ? "difference" : "normal" }}
        className="absolute left-0 top-0"
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="grid place-items-center rounded-full border backdrop-blur-[3px] backdrop-saturate-150"
          animate={{
            width: fieldSize,
            height: fieldSize,
            marginLeft: -fieldSize / 2,
            marginTop: -fieldSize / 2,
            backgroundColor: grabbing
              ? grabColor
              : label
                ? "var(--c-accent)"
                : active
                  ? "color-mix(in srgb, var(--c-fg) 9%, transparent)"
                  : "color-mix(in srgb, var(--c-fg) 4%, transparent)",
            borderColor: grabbing
              ? grabColor
              : label
                ? "var(--c-accent)"
                : active
                  ? "color-mix(in srgb, var(--c-fg) 34%, transparent)"
                  : "color-mix(in srgb, var(--c-fg) 16%, transparent)",
            scale: pressed ? 0.85 : 1,
          }}
          transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatePresence>
            {label && !grabbing && (
              <motion.span
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.18 }}
                className="u-meta whitespace-nowrap text-on-accent"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Crosshair and centre dot — exact, never lagging.
          Plain divs rather than an <svg>: animating SVG geometry attributes
          makes the first render emit width="undefined" before the animation
          fills it in, which the browser logs as an attribute error. Divs carry
          their size in CSS, so there is nothing to be undefined. Positions are
          relative to this wrapper, whose origin is the true pointer point. */}
      <motion.div
        style={{ x, y, mixBlendMode: grabbing ? "difference" : "normal" }}
        className="absolute left-0 top-0"
        animate={{ opacity: visible && !label ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      >
        {ARMS.map(({ key, vertical, sign }) => (
          <motion.span
            key={key}
            className="absolute block"
            animate={
              vertical
                ? {
                    width: 1,
                    height: arm,
                    x: -0.5,
                    y: sign > 0 ? gap : -gap - arm,
                    backgroundColor: grabbing
                      ? grabColor
                      : "color-mix(in srgb, var(--c-accent) 70%, transparent)",
                  }
                : {
                    width: arm,
                    height: 1,
                    x: sign > 0 ? gap : -gap - arm,
                    y: -0.5,
                    backgroundColor: grabbing
                      ? grabColor
                      : "color-mix(in srgb, var(--c-accent) 70%, transparent)",
                  }
            }
            transition={spring}
          />
        ))}

        <motion.span
          className="absolute block rounded-full"
          animate={{
            width: 3,
            height: 3,
            x: -1.5,
            y: -1.5,
            opacity: active && !grabbing ? 0 : 1,
            backgroundColor: grabbing ? grabColor : "var(--c-accent-2)",
          }}
          transition={spring}
        />
      </motion.div>
    </div>
  );
}
