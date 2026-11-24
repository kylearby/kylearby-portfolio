"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { animate, useMotionValue, useReducedMotion } from "framer-motion";
import { site } from "@/lib/site";

/**
 * FRAGMENT PORTRAIT
 * ---------------------------------------------------------------------------
 * The blue and red halftone separations stacked and sliced into horizontal
 * bands. At rest every band sits at zero offset, so the two layers register
 * exactly and read as one clean duotone image. Under a pointer the bands
 * shear sideways — blue one way, red the other — which tears the registration
 * apart into a chromatic, datamoshed fragment of itself.
 *
 * What makes it reactive rather than a blanket glitch: shear is weighted by
 * each band's distance from the pointer, on a gaussian falloff. The tear
 * happens *where you are*, and the rest of the frame stays intact.
 *
 * Two input paths, matching Portrait's:
 *  - mouse → bands follow continuously while the pointer is inside
 *  - touch → no hover to follow, so a tap detonates a pulse centred on the
 *            tap point and lets it settle back
 *
 * Implementation notes:
 *  - Band transforms are written straight to the DOM inside one rAF loop.
 *    Driving 24 elements through React state would re-render the tree every
 *    frame for what is purely visual output.
 *  - The loop only runs while there is something to animate, and stops itself
 *    once the intensity settles back to zero.
 *  - Seeds are a deterministic hash of the band index, never Math.random().
 *    A random value generated during render differs between the server and
 *    client passes and trips a hydration mismatch.
 *  - Under prefers-reduced-motion the whole mechanism is skipped and the
 *    layers render as a static composite. Fragmentation is the motion here;
 *    there is no meaningful reduced version of it.
 */

/** Horizontal slices. More is finer-grained and more elements to paint. */
const BANDS = 12;
/** Peak shear, as a percentage of frame width. */
const MAX_SHIFT = 9;
/** Width of the gaussian falloff around the pointer, in frame heights. */
const SIGMA = 0.16;

/** Deterministic −1…1 per band. Stable across server and client renders. */
function seedFor(i: number) {
  const x = Math.sin((i + 1) * 127.1) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

const SEEDS = Array.from({ length: BANDS }, (_, i) => seedFor(i));

/** Exact, gapless tiling — band i covers [i/N, (i+1)/N] of the height. */
function bandClip(i: number) {
  const top = (i / BANDS) * 100;
  const bottom = 100 - ((i + 1) / BANDS) * 100;
  return `inset(${top}% 0 ${bottom}% 0)`;
}

export function FragmentPortrait({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const blueRefs = useRef<(HTMLDivElement | null)[]>([]);
  const redRefs = useRef<(HTMLDivElement | null)[]>([]);

  const intensity = useMotionValue(0);
  const pointerY = useRef(0.5);
  const rafRef = useRef<number | null>(null);

  const paint = () => {
    const t = intensity.get();
    const py = pointerY.current;

    for (let i = 0; i < BANDS; i++) {
      const centre = (i + 0.5) / BANDS;
      const d = centre - py;
      const proximity = Math.exp(-(d * d) / (2 * SIGMA * SIGMA));
      const shift = SEEDS[i] * MAX_SHIFT * proximity * t;

      const b = blueRefs.current[i];
      const r = redRefs.current[i];
      // Opposing directions are what separate the two separations into a
      // chromatic tear rather than sliding them as one block.
      if (b) b.style.transform = `translate3d(${shift}%,0,0)`;
      if (r) r.style.transform = `translate3d(${-shift * 0.72}%,0,0)`;
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
    // Settle everything back to exact registration.
    for (let i = 0; i < BANDS; i++) {
      const b = blueRefs.current[i];
      const r = redRefs.current[i];
      if (b) b.style.transform = "";
      if (r) r.style.transform = "";
    }
  };

  useEffect(() => () => stopLoop(), []);

  const toPointerY = (clientY: number) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    pointerY.current = (clientY - rect.top) / rect.height;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    toPointerY(e.clientY);
  };

  const onPointerEnter = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    toPointerY(e.clientY);
    startLoop();
    animate(intensity, 1, { duration: 0.28, ease: [0.16, 1, 0.3, 1] });
  };

  const onPointerLeave = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    animate(intensity, 0, {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
      onComplete: stopLoop,
    });
  };

  /** Touch has no hover, so a tap detonates a pulse where it landed. */
  const onPointerDown = (e: React.PointerEvent) => {
    if (reduce || e.pointerType === "mouse") return;
    toPointerY(e.clientY);
    startLoop();
    animate(intensity, [0, 1, 0], {
      duration: 1.3,
      times: [0, 0.22, 1],
      ease: [[0.16, 1, 0.3, 1], [0.4, 0, 0.6, 1]],
      onComplete: stopLoop,
    });
  };

  const layer = (
    src: string,
    which: "blue" | "red",
    refs: React.MutableRefObject<(HTMLDivElement | null)[]>
  ) =>
    Array.from({ length: BANDS }, (_, i) => (
      <div
        key={`${which}-${i}`}
        ref={(el) => {
          refs.current[i] = el;
        }}
        aria-hidden="true"
        className="absolute inset-0 will-change-transform"
        style={{ clipPath: bandClip(i) }}
      >
        <Image
          src={src}
          alt=""
          fill
          // Only the first band of each layer is prioritised — the rest reuse
          // the same optimised URL, so this is two requests, not twenty-four.
          priority={i === 0}
          sizes="(max-width: 768px) 78vw, 30vw"
          className="object-cover"
        />
      </div>
    ));

  return (
    <div
      ref={frameRef}
      role="img"
      aria-label={site.headshot.alt}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      className={`relative aspect-[3/4] touch-manipulation select-none overflow-hidden ${className}`}
    >
      {layer(site.portrait.blue, "blue", blueRefs)}
      {layer(site.portrait.red, "red", redRefs)}
    </div>
  );
}
