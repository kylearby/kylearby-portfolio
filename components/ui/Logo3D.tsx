"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type PanInfo,
} from "framer-motion";
import { useEffect, useRef, useState, type RefObject } from "react";
import {
  LOGO_FRAME,
  LOGO_NAME,
  LOGO_SANTOS,
  LOGO_SRC,
  boxStyle,
  maskStyle,
  type LogoBox,
} from "@/lib/logo";
import { EASE_OUT_EXPO } from "@/lib/motion";

/**
 * LOGO 3D
 * ---------------------------------------------------------------------------
 * The real lockup, extruded into a solid object you can pick up and throw
 * around the hero.
 *
 * There is no WebGL here and no 3D model. Depth is built by stacking copies of
 * the same alpha mask along the Z axis inside a `preserve-3d` context, each
 * one mixed further toward the background so the extrusion reads as a shaded
 * side wall. The front face carries a diagonal gradient for the specular
 * highlight. That keeps the whole thing as CSS — it themes itself, it costs no
 * runtime library, and it stays crisp at any size.
 *
 * Interaction:
 *  - the first drag unpins it from the grid; after that it moves freely
 *    anywhere inside the section, clamped by `dragConstraints`
 *  - rotation is no longer steered directly — it is derived from drag
 *    velocity, so the object leans into its own movement and settles flat
 *  - a soft accent glow trails behind while it is moving and fades the moment
 *    it is released
 *
 * Pointer policy: free two-axis dragging is enabled for mice only. On touch,
 * a draggable element this large would swallow vertical swipes and trap the
 * page scroll, so there it stays put.
 *
 * Under reduced motion the idle tilt and entrance are dropped. Dragging still
 * works, because that motion is user-initiated.
 */

/** Number of extruded side layers. More is smoother and more expensive. */
const LAYERS = 14;

/** Degrees of lean at full drag speed. */
const MAX_LEAN_Y = 20;
const MAX_LEAN_X = 14;

/** Drag speed, px/s, that counts as "full tilt" and full glow. */
const FULL_SPEED = 1400;

/** Speed that saturates the glow. Lower than FULL_SPEED so an ordinary drag
 *  lights it properly instead of only a hard flick. */
const GLOW_SPEED = 850;

/** Glow floor while the object is held, so picking it up always registers. */
const GLOW_FLOOR = 0.28;

/** Degrees of tilt contributed by pointer parallax at rest. */
const TILT = 5;

/** Higher = flatter projection = less outward throw at the same angle. */
const PERSPECTIVE_RATIO = 2.4;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

function Word({
  src,
  box,
  face,
  step,
}: {
  src: string;
  box: LogoBox;
  /** CSS colour for the front face. */
  face: string;
  /** Z distance between extrusion layers, in px. */
  step: number;
}) {
  const place = { ...boxStyle(box, LOGO_FRAME), ...maskStyle(src) };
  const layers = [];

  // Deepest first. Each layer sits further back and mixes further toward the
  // background, which is what makes the side wall read as shaded rather than
  // as a flat drop shadow.
  for (let i = LAYERS; i >= 1; i--) {
    const t = i / LAYERS;
    const mix = Math.round(70 - t * 44);
    layers.push(
      <span
        key={`z${i}`}
        aria-hidden="true"
        className="absolute"
        style={{
          ...place,
          backgroundColor: `color-mix(in srgb, ${face} ${mix}%, var(--c-bg))`,
          transform: `translateZ(${-i * step}px)`,
        }}
      />
    );
  }

  // Front face, lit from the top-left.
  layers.push(
    <span
      key="face"
      aria-hidden="true"
      className="absolute"
      style={{
        ...place,
        backgroundImage: `linear-gradient(152deg,
          color-mix(in srgb, ${face} 72%, white) 0%,
          ${face} 34%,
          ${face} 62%,
          color-mix(in srgb, ${face} 82%, black) 100%)`,
      }}
    />
  );

  return <>{layers}</>;
}

export function Logo3D({
  className = "",
  boundsRef,
}: {
  className?: string;
  /** The area the object is free to roam — normally the hero section. */
  boundsRef: RefObject<HTMLElement | null>;
}) {
  const reduce = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [canDrag, setCanDrag] = useState(false);

  // Extrusion depth has to scale with the rendered size or the object looks
  // like paper when large and like a brick when small.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width)
    );
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  // Free 2D dragging is a mouse affordance. See the pointer policy above.
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const apply = () => setCanDrag(fine.matches);
    apply();
    fine.addEventListener("change", apply);
    return () => fine.removeEventListener("change", apply);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Rotation now comes from how fast it is being thrown, not from steering.
  const vx = useVelocity(x);
  const vy = useVelocity(y);
  const leanY = useTransform(vx, [-FULL_SPEED, FULL_SPEED], [-MAX_LEAN_Y, MAX_LEAN_Y]);
  const leanX = useTransform(vy, [-FULL_SPEED, FULL_SPEED], [MAX_LEAN_X, -MAX_LEAN_X]);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);

  const rawX = useTransform<number, number>([leanX, tiltX], ([a, b]) => a + b);
  const rawY = useTransform<number, number>([leanY, tiltY], ([a, b]) => a + b);

  const rotateX = useSpring(rawX, { stiffness: 150, damping: 18, mass: 0.7 });
  const rotateY = useSpring(rawY, { stiffness: 150, damping: 18, mass: 0.7 });

  // The glow lags well behind the object, which is what reads as a trail.
  const trailX = useSpring(x, { stiffness: 70, damping: 17, mass: 1.2 });
  const trailY = useSpring(y, { stiffness: 70, damping: 17, mass: 1.2 });
  const heat = useMotionValue(0);
  // Rises fast enough to be seen on a quick flick, settles without bouncing.
  const glow = useSpring(heat, { stiffness: 240, damping: 26 });
  const glowOpacity = useTransform(glow, [0, 1], [0, 0.55]);
  const glowScale = useTransform(glow, [0, 1], [0.9, 1.15]);

  // Shadow tracks the object and flattens as it tips.
  const shadowScale = useTransform(rotateX, [-MAX_LEAN_X, 0, MAX_LEAN_X], [0.9, 1, 1.1]);

  // Idle parallax — only while the object is not being held.
  const dragging = useRef(false);
  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || dragging.current) return;
      const el = frameRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      tiltY.set(clamp(nx, -1, 1) * TILT);
      tiltX.set(clamp(-ny, -1, 1) * TILT);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, tiltX, tiltY]);

  const step = width > 0 ? (width / 1000) * 2.4 : 1.2;

  const onDragStart = () => {
    dragging.current = true;
    // Lets the cursor keep showing the fist even when the pointer strays off
    // the object mid-throw.
    document.documentElement.setAttribute("data-grabbing", "");
    tiltX.set(0);
    tiltY.set(0);
    // Picking it up lights the trail immediately; movement takes it the rest
    // of the way. Without a floor, a slow careful drag would show nothing.
    heat.set(GLOW_FLOOR);
  };

  const onDrag = (_: PointerEvent, info: PanInfo) => {
    const speed = Math.hypot(info.velocity.x, info.velocity.y);
    const moving = clamp(speed / GLOW_SPEED, 0, 1);
    heat.set(GLOW_FLOOR + (1 - GLOW_FLOOR) * moving);
  };

  const onDragEnd = () => {
    dragging.current = false;
    document.documentElement.removeAttribute("data-grabbing");
    // The trail belongs to the movement, so it goes when the movement does.
    heat.set(0);
  };

  useEffect(
    () => () => document.documentElement.removeAttribute("data-grabbing"),
    []
  );

  return (
    <div ref={frameRef} className={`relative ${className}`}>
      {/* Trailing glow. Outside the 3D context — a filter inside a preserve-3d
          subtree forces the browser to flatten it. */}
      {!reduce && (
        <motion.div
          aria-hidden="true"
          style={{
            x: trailX,
            y: trailY,
            opacity: glowOpacity,
            scale: glowScale,
          }}
          className="
            pointer-events-none absolute -inset-[12%] rounded-[50%]
            bg-[radial-gradient(closest-side,var(--c-accent),transparent_72%)]
            blur-3xl
          "
        />
      )}

      {/* Contact shadow. */}
      <motion.div
        aria-hidden="true"
        style={{ x, y, scaleX: shadowScale }}
        className="
          pointer-events-none absolute inset-x-[10%] bottom-[4%] h-[9%]
          rounded-[50%] bg-fg/12 blur-2xl dark:bg-black/45
        "
      />

      <motion.div
        role="img"
        aria-label="Kyle Arby Santos"
        data-cursor-icon="hand"
        drag={canDrag}
        dragConstraints={boundsRef}
        dragElastic={0.06}
        dragMomentum
        dragTransition={{
          power: 0.18,
          timeConstant: 200,
          bounceStiffness: 300,
          bounceDamping: 34,
        }}
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        // Only opacity and y are animated on entry. rotateX/rotateY are
        // spring-driven motion values; animating them here would fight the
        // spring for ownership of the same value.
        initial={reduce ? false : { opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: EASE_OUT_EXPO }}
        style={{
          x,
          y,
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          transformPerspective: Math.max(900, width * PERSPECTIVE_RATIO),
          aspectRatio: `${LOGO_FRAME.w} / ${LOGO_FRAME.h}`,
          willChange: "transform",
        }}
        className="relative w-full select-none"
      >
        <Word
          src={LOGO_SRC.name}
          box={LOGO_NAME}
          face="var(--c-fg)"
          step={step}
        />
        <Word
          src={LOGO_SRC.santos}
          box={LOGO_SANTOS}
          face="var(--c-logo-2)"
          step={step}
        />
      </motion.div>
    </div>
  );
}
