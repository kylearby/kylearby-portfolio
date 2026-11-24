"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { GlitchWord } from "@/components/ui/GlitchWord";

/**
 * Infinite typographic marquee, draggable.
 *
 * Two identical tracks sit side by side and the pair translates left. The
 * offset is wrapped modulo one track width every frame, so whichever way it is
 * pushed there is always a full track covering the viewport and the seam never
 * appears.
 *
 * This runs on a rAF loop rather than a CSS animation. The CSS version was
 * cheaper — compositor-only, zero main thread — but a CSS animation has no
 * position to read or write, so it cannot be dragged. One style write per
 * frame per marquee is the price of the interaction. The loop is gated on an
 * IntersectionObserver and does not run at all while the band is off screen,
 * which is most of the time.
 *
 * Drag: pointer capture on the track, delta applied straight to the offset.
 * Releasing hands the pointer's own velocity to a momentum term that decays
 * back into the base drift, so a throw coasts to a stop instead of snapping.
 *
 * Under prefers-reduced-motion the drift stops and the glitch never fires; the
 * words stay put and legible. Dragging still works, because that is the user
 * moving the content themselves rather than the page moving on its own.
 */

/** How fast a throw bleeds off, per second. */
const MOMENTUM_DECAY = 0.0015;
/** Below this the throw is over and the base drift takes back over. */
const MOMENTUM_FLOOR = 8;
/**
 * Ceiling on a throw, in px/sec. A flick that covers a lot of ground in one
 * pointer event — a fast wrist, a coarse touch digitiser, a synthetic event —
 * divides a big delta by a tiny interval and yields a velocity in the tens of
 * thousands, which fires the track off like a slingshot. Roughly 20x the base
 * drift is fast enough to feel thrown and slow enough to stay readable.
 */
const MAX_MOMENTUM = 2600;
/**
 * Floor on the interval used for that division, in ms. Two events landing in
 * the same millisecond must not read as infinite speed.
 */
const MIN_VELOCITY_DT = 8;
/** A drag beyond this many px stops the click that follows it. */
const DRAG_SLOP = 4;

/** One glitch burst, in ms. Matches the keyframe timings in globals.css. */
const GLITCH_MS = 620;

export function Marquee({
  items,
  speed = 42,
  reverse = false,
  className = "",
}: {
  items: string[];
  /** Seconds for one full pass. Higher is slower. */
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();

  const viewportRef = useRef<HTMLDivElement>(null);
  const movingRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const offset = useRef(0);
  const momentum = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const lastT = useRef(0);
  const travelled = useRef(0);
  const rafRef = useRef<number | null>(null);
  const visible = useRef(false);

  /** Index of the word currently misregistering, or null. */
  const [glitchAt, setGlitchAt] = useState<number | null>(null);

  /* ---- drift + drag loop ------------------------------------------------ */

  useEffect(() => {
    const viewport = viewportRef.current;
    const moving = movingRef.current;
    const track = trackRef.current;
    if (!viewport || !moving || !track) return;

    let prev = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(64, now - prev);
      prev = now;

      const trackW = track.offsetWidth;
      if (trackW > 0) {
        if (!dragging.current) {
          // Base drift, in px/sec, derived from the caller's "seconds for one
          // full pass" so the timing stays width-independent.
          const drift = reduce ? 0 : (trackW / speed) * (reverse ? 1 : -1);
          offset.current += ((drift + momentum.current) * dt) / 1000;

          if (momentum.current !== 0) {
            momentum.current *= Math.pow(MOMENTUM_DECAY, dt / 1000);
            if (Math.abs(momentum.current) < MOMENTUM_FLOOR) {
              momentum.current = 0;
            }
          }
        }

        // Wrap into [-trackW, 0). Two tracks are laid end to end, so any
        // offset in this range keeps the viewport fully covered.
        offset.current = (((offset.current % trackW) - trackW) % trackW);
        moving.style.transform = `translate3d(${offset.current}px,0,0)`;
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    const start = () => {
      if (rafRef.current === null) {
        prev = performance.now();
        rafRef.current = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    // Off screen the band has nothing to show, so it should not be costing
    // frames. This is also what makes the rAF rewrite defensible at all.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        if (entry.isIntersecting) start();
        else stop();
      },
      { rootMargin: "120px" }
    );
    io.observe(viewport);

    return () => {
      io.disconnect();
      stop();
    };
  }, [reduce, reverse, speed]);

  /* ---- periodic glitch -------------------------------------------------- */

  useEffect(() => {
    if (reduce) return;

    let timer: ReturnType<typeof setTimeout>;
    let clear: ReturnType<typeof setTimeout>;

    const schedule = () => {
      // Irregular gaps. An evenly spaced glitch stops reading as a fault and
      // starts reading as a metronome.
      timer = setTimeout(
        () => {
          // Nothing to see while the band is scrolled past — skip the burst
          // rather than fire it into an empty viewport.
          if (visible.current) {
            setGlitchAt(Math.floor(Math.random() * items.length));
            clear = setTimeout(() => setGlitchAt(null), GLITCH_MS);
          }
          schedule();
        },
        1800 + Math.random() * 2600
      );
    };

    schedule();
    return () => {
      clearTimeout(timer);
      clearTimeout(clear);
    };
  }, [reduce, items.length]);

  /* ---- pointer ---------------------------------------------------------- */

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    momentum.current = 0;
    travelled.current = 0;
    lastX.current = e.clientX;
    lastT.current = performance.now();
    // Throws if the pointer is already gone by the time this runs. The drag
    // still works without capture — it just stops tracking once the cursor
    // leaves the band — so this is not worth failing the handler over.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    // Same signal Logo3D raises, so the cursor holds its fist even if the
    // drag outruns the pointer and slides off the band.
    document.documentElement.setAttribute("data-grabbing", "");
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const now = performance.now();
    const dx = e.clientX - lastX.current;
    const dt = now - lastT.current;

    offset.current += dx;
    travelled.current += Math.abs(dx);
    // Instantaneous velocity, so a throw carries the speed of its last few
    // milliseconds rather than the average of the whole gesture — then bounded
    // at both ends so one coarse event cannot turn into a slingshot.
    const v = (dx / Math.max(dt, MIN_VELOCITY_DT)) * 1000;
    momentum.current = Math.max(-MAX_MOMENTUM, Math.min(MAX_MOMENTUM, v));

    lastX.current = e.clientX;
    lastT.current = now;
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    document.documentElement.removeAttribute("data-grabbing");
  };

  // A drag that happens to start on a word should not also count as a click
  // on it. Nothing in the band is a link today, but the guard belongs with
  // the drag rather than with whatever gets added later.
  const onClickCapture = (e: React.MouseEvent) => {
    if (travelled.current > DRAG_SLOP) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(
    () => () => document.documentElement.removeAttribute("data-grabbing"),
    []
  );

  /* ---- render ----------------------------------------------------------- */

  const renderTrack = (duplicate: boolean) => (
    <div
      // Only the first track is measured; both are identical.
      ref={duplicate ? undefined : trackRef}
      className="flex shrink-0 items-center"
      // The second copy exists only to close the loop; it is not content.
      aria-hidden={duplicate ? "true" : undefined}
    >
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className="flex shrink-0 items-center">
          <span className="px-[0.3em] whitespace-nowrap">
            <GlitchWord
              word={item}
              active={glitchAt === i}
              duration={GLITCH_MS}
            />
          </span>
          <span
            aria-hidden="true"
            className="mx-[0.5em] inline-block size-[0.14em] shrink-0 rounded-full bg-accent align-middle"
          />
        </span>
      ))}
    </div>
  );

  return (
    <div
      ref={viewportRef}
      data-cursor-icon="hand"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
      // `pb` is the descender fix. `leading-none` makes the line box exactly
      // 1em, but Manrope's baseline sits at 0.88em and its deepest tails run
      // 0.26em past that — so a "g" or "y" ends up at 1.15em, outside the box,
      // and the overflow clip sliced it off. Overflow clips at the *padding*
      // edge, so this buys the tails room without touching the line rhythm.
      // 0.2em also clears the font's full descent metric (0.1875em), which
      // means any glyph is safe here, not just the ones currently in the list.
      // `touch-pan-y` keeps a vertical swipe scrolling the page — only
      // horizontal drags are claimed here.
      className={`
        group/marquee relative flex touch-pan-y select-none overflow-hidden
        pb-[0.2em] ${className}
      `}
    >
      <div ref={movingRef} className="flex will-change-transform">
        {renderTrack(false)}
        {renderTrack(true)}
      </div>
    </div>
  );
}
