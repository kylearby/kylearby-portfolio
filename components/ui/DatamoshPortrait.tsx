"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { site } from "@/lib/site";

/**
 * DATAMOSH PORTRAIT
 * ---------------------------------------------------------------------------
 * Greyscale at rest. The colour photograph is split into its red, green and
 * blue channels, and each channel is revealed through its own pointer-tracked
 * mask — but the three masks chase the pointer on *different* springs.
 *
 * Standing still, all three converge and the channels re-register into a
 * clean colour photo. Moving, they string out behind the pointer at different
 * rates and the reveal smears into a chromatic trail. The separation is a
 * product of your speed, not a fixed offset.
 *
 * Inside each channel the image is sliced into bands that shear sideways with
 * that same speed, so the revealed area tears rather than sliding cleanly —
 * the datamosh half of the effect.
 *
 * Shares the hero's language (banded shear, red/blue separation) without
 * repeating it: the hero tears a flat duotone apart across the whole frame,
 * this one reconstructs a real photograph inside a moving window.
 *
 * Why channel isolation rather than tinted copies: screen-compositing
 * isolated R, G and B reproduces the original image exactly when the offsets
 * are zero. Stacking tinted duplicates would blow out the highlights at rest,
 * which is the one state that has to look untouched.
 *
 * Performance: the three masks are the only per-frame repaint. The 24 band
 * shears are transforms, which stay on the compositor.
 *
 * Under prefers-reduced-motion the trail and shear are dropped and hover
 * simply cross-fades the colour frame — a smear chasing the cursor is exactly
 * the kind of motion that setting exists to remove.
 */

/** Horizontal slices per channel. */
const BANDS = 8;
/** Peak band shear at full speed, as a percentage of frame width. */
const MAX_SHEAR = 5;
/** Reveal radius while the pointer is inside, in px. */
const REVEAL_RADIUS = 175;
/** Pointer travel per frame, in % of frame, treated as full tilt. */
const FULL_SPEED = 4;

/**
 * Different stiffnesses are the whole trick — red lags furthest behind the
 * pointer, blue tracks it closest, green sits between them.
 */
const SPRING_R = { stiffness: 90, damping: 18, mass: 0.9 };
const SPRING_G = { stiffness: 170, damping: 21, mass: 0.7 };
const SPRING_B = { stiffness: 320, damping: 27, mass: 0.5 };

/**
 * Deterministic minus-one-to-one per band. Never Math.random(): a value
 * generated during render differs between the server and client passes and
 * trips a hydration mismatch.
 */
function seedFor(i: number) {
  const x = Math.sin((i + 1) * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}
const SEEDS = Array.from({ length: BANDS }, (_, i) => seedFor(i));

/** Exact, gapless tiling — band i covers its slice of the height. */
function bandClip(i: number) {
  const top = (i / BANDS) * 100;
  const bottom = 100 - ((i + 1) / BANDS) * 100;
  return `inset(${top}% 0 ${bottom}% 0)`;
}

export function DatamoshPortrait({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const frameRef = useRef<HTMLDivElement>(null);

  const litRef = useRef(false);
  const speed = useRef(0);
  const lastPt = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  const rBands = useRef<(HTMLDivElement | null)[]>([]);
  const gBands = useRef<(HTMLDivElement | null)[]>([]);
  const bBands = useRef<(HTMLDivElement | null)[]>([]);

  // Pointer position as a percentage of the frame.
  const px = useMotionValue(50);
  const py = useMotionValue(50);

  const rx = useSpring(px, SPRING_R);
  const ry = useSpring(py, SPRING_R);
  const gx = useSpring(px, SPRING_G);
  const gy = useSpring(py, SPRING_G);
  const bx = useSpring(px, SPRING_B);
  const by = useSpring(py, SPRING_B);

  const radius = useMotionValue(0);
  const fade = useMotionValue(0);

  const maskR = useMotionTemplate`radial-gradient(circle ${radius}px at ${rx}% ${ry}%, #000 0%, #000 52%, rgba(0,0,0,0.5) 76%, transparent 100%)`;
  const maskG = useMotionTemplate`radial-gradient(circle ${radius}px at ${gx}% ${gy}%, #000 0%, #000 52%, rgba(0,0,0,0.5) 76%, transparent 100%)`;
  const maskB = useMotionTemplate`radial-gradient(circle ${radius}px at ${bx}% ${by}%, #000 0%, #000 52%, rgba(0,0,0,0.5) 76%, transparent 100%)`;

  const paint = () => {
    // Speed decays on its own, so the tear settles when the pointer stops
    // even though no further move events arrive.
    speed.current *= 0.9;
    const s = Math.min(1, speed.current / FULL_SPEED);

    for (let i = 0; i < BANDS; i++) {
      const shear = SEEDS[i] * MAX_SHEAR * s;
      const r = rBands.current[i];
      const g = gBands.current[i];
      const b = bBands.current[i];
      if (r) r.style.transform = `translate3d(${shear}%,0,0)`;
      if (g) g.style.transform = `translate3d(${shear * 0.35}%,0,0)`;
      if (b) b.style.transform = `translate3d(${-shear * 0.8}%,0,0)`;
    }

    rafRef.current = requestAnimationFrame(paint);
  };

  const startLoop = () => {
    if (rafRef.current === null) rafRef.current = requestAnimationFrame(paint);
  };

  const stopLoop = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    speed.current = 0;
    lastPt.current = null;
    for (let i = 0; i < BANDS; i++) {
      const r = rBands.current[i];
      const g = gBands.current[i];
      const b = bBands.current[i];
      if (r) r.style.transform = "";
      if (g) g.style.transform = "";
      if (b) b.style.transform = "";
    }
  };

  useEffect(() => () => stopLoop(), []);

  const toPercent = (clientX: number, clientY: number) => {
    const el = frameRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const seatChannels = (x: number, y: number) => {
    rx.jump(x);
    ry.jump(y);
    gx.jump(x);
    gy.jump(y);
    bx.jump(x);
    by.jump(y);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !litRef.current) return;
    const p = toPercent(e.clientX, e.clientY);
    if (!p) return;
    if (lastPt.current) {
      const dx = p.x - lastPt.current.x;
      const dy = p.y - lastPt.current.y;
      // Accumulate rather than replace, so a fast flick spikes the tear.
      speed.current = Math.min(
        FULL_SPEED * 1.5,
        speed.current + Math.hypot(dx, dy)
      );
    }
    lastPt.current = p;
    px.set(p.x);
    py.set(p.y);
  };

  const onPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    litRef.current = true;
    if (reduce) {
      animate(fade, 1, { duration: 0.3 });
      return;
    }
    const p = toPercent(e.clientX, e.clientY);
    if (p) {
      px.set(p.x);
      py.set(p.y);
      // Land every channel on the entry point so the reveal opens in
      // register instead of streaking in from wherever it last was.
      seatChannels(p.x, p.y);
      lastPt.current = p;
    }
    startLoop();
    animate(radius, REVEAL_RADIUS, { duration: 0.45, ease: [0.16, 1, 0.3, 1] });
  };

  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    litRef.current = false;
    if (reduce) {
      animate(fade, 0, { duration: 0.3 });
      return;
    }
    animate(radius, 0, {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
      onComplete: stopLoop,
    });
  };

  /** Touch has no hover, so a tap opens the window and bursts the tear. */
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    if (reduce) {
      animate(fade, fade.get() > 0.5 ? 0 : 1, { duration: 0.3 });
      return;
    }
    const p = toPercent(e.clientX, e.clientY);
    if (p) {
      // Seat the channels *off* the tap point, then send the target to it.
      // A tap has no travel, so without this the springs have nothing to
      // chase and all three open already in register — shear, but no colour
      // separation at all. Starting them displaced lets them converge at
      // their three different rates, so the tap moshes into focus.
      seatChannels(p.x - 16, p.y - 9);
      px.set(p.x);
      py.set(p.y);
    }
    // Seed the tear directly — a tap has no travel to derive speed from.
    speed.current = FULL_SPEED * 1.2;
    startLoop();
    animate(radius, [0, REVEAL_RADIUS * 1.15, 0], {
      duration: 1.5,
      times: [0, 0.25, 1],
      ease: [
        [0.16, 1, 0.3, 1],
        [0.4, 0, 0.6, 1],
      ],
      onComplete: stopLoop,
    });
  };

  const channel = (
    key: "r" | "g" | "b",
    mask: MotionValue<string>,
    refs: React.MutableRefObject<(HTMLDivElement | null)[]>
  ) => (
    <motion.div
      key={key}
      aria-hidden="true"
      className="absolute inset-0 mix-blend-screen"
      style={{
        filter: `url(#${uid}-${key})`,
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }}
    >
      {Array.from({ length: BANDS }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="absolute inset-0 will-change-transform"
          style={{ clipPath: bandClip(i) }}
        >
          <Image
            src={site.headshot.color}
            alt=""
            fill
            sizes="(max-width: 768px) 78vw, 30vw"
            className="object-cover"
          />
        </div>
      ))}
    </motion.div>
  );

  return (
    <figure className={`relative ${className}`}>
      {/* Channel-isolation filters. Screen-compositing the three reproduces
          the source image exactly when they sit in register. sRGB is
          explicit — the linearRGB default would shift the reconstruction. */}
      <svg aria-hidden="true" className="absolute size-0" focusable="false">
        <defs>
          <filter id={`${uid}-r`} colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            />
          </filter>
          <filter id={`${uid}-g`} colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            />
          </filter>
          <filter id={`${uid}-b`} colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>

      <div
        ref={frameRef}
        onPointerMove={onPointerMove}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        className="u-grain-photo relative aspect-[4/5] touch-manipulation select-none overflow-hidden border border-line bg-surface"
      >
        {/* Base frame — the one that always loads. */}
        <Image
          src={site.headshot.bw}
          alt={site.headshot.alt}
          fill
          priority
          sizes="(max-width: 768px) 78vw, 30vw"
          className="object-cover"
        />

        {reduce ? (
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ opacity: fade }}
          >
            <Image
              src={site.headshot.color}
              alt=""
              fill
              sizes="(max-width: 768px) 78vw, 30vw"
              className="object-cover"
            />
          </motion.div>
        ) : (
          /* Isolated so the three channels screen against each other and not
             against the greyscale underneath — otherwise the reveal would
             lighten the base rather than replace it. */
          <div aria-hidden="true" className="absolute inset-0 isolate">
            {channel("r", maskR, rBands)}
            {channel("g", maskG, gBands)}
            {channel("b", maskB, bBands)}
          </div>
        )}
      </div>
    </figure>
  );
}
