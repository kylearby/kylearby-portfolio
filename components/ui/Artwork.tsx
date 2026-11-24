import Image from "next/image";
import type { Motif } from "@/lib/projects";

/**
 * ARTWORK
 * ---------------------------------------------------------------------------
 * Renders a real photograph when one exists, and a generated editorial
 * composition when one does not — so the gallery reads as intentional
 * abstraction rather than as missing assets.
 *
 * Compositions are deterministic: the same seed always draws the same image,
 * on the server and on the client. Everything is painted with theme tokens,
 * so each piece retones itself in dark mode instead of inverting.
 */

/** mulberry32 — small, fast, stable across server and client. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 800;
const H = 1000;

/**
 * Tones are mixed from the foreground rather than taken from the surface
 * tokens. V2's surfaces sit within a few percent of the page ground, so
 * surface-based tones rendered as an almost invisible plate. Mixing against
 * --c-fg guarantees real tonal separation whichever ground is behind it.
 */
const TONE = {
  base: "var(--c-surface)",
  raise: "color-mix(in srgb, var(--c-fg) 9%, var(--c-surface))",
  line: "color-mix(in srgb, var(--c-fg) 20%, var(--c-surface))",
  deep: "color-mix(in srgb, var(--c-fg) 38%, var(--c-surface))",
  accent: "var(--c-accent)",
};

function Aperture(r: () => number) {
  const cx = W * (0.42 + r() * 0.16);
  const cy = H * (0.4 + r() * 0.16);
  const rad = Math.min(W, H) * (0.3 + r() * 0.1);
  return (
    <>
      <rect width={W} height={H} fill={TONE.base} />
      <circle cx={cx} cy={cy} r={rad * 1.55} fill={TONE.raise} />
      <circle cx={cx} cy={cy} r={rad} fill={TONE.base} />
      <circle
        cx={cx}
        cy={cy}
        r={rad}
        fill="none"
        stroke={TONE.deep}
        strokeWidth={1.25}
        opacity={0.5}
      />
      <path
        d={`M ${cx - rad} ${cy} A ${rad} ${rad} 0 0 1 ${cx} ${cy - rad}`}
        fill="none"
        stroke={TONE.accent}
        strokeWidth={2.5}
      />
      <line
        x1={0}
        y1={cy}
        x2={W}
        y2={cy}
        stroke={TONE.line}
        strokeWidth={1}
        opacity={0.7}
      />
    </>
  );
}

function Strata(r: () => number) {
  const bands: React.ReactNode[] = [];
  const count = 5 + Math.floor(r() * 3);
  let y = 0;
  const accentAt = Math.floor(r() * count);
  for (let i = 0; i < count; i++) {
    const h = (H / count) * (0.55 + r() * 0.9);
    bands.push(
      <rect
        key={i}
        x={0}
        y={y}
        width={W}
        height={h}
        fill={i % 2 === 0 ? TONE.raise : TONE.base}
      />
    );
    if (i === accentAt) {
      bands.push(
        <rect
          key={`a${i}`}
          x={0}
          y={y + h - 6}
          width={W * (0.3 + r() * 0.5)}
          height={6}
          fill={TONE.accent}
        />
      );
    }
    y += h;
  }
  return (
    <>
      <rect width={W} height={H} fill={TONE.base} />
      {bands}
      <line
        x1={W * 0.68}
        y1={0}
        x2={W * 0.68}
        y2={H}
        stroke={TONE.deep}
        strokeWidth={1}
        opacity={0.45}
      />
    </>
  );
}

function Field(r: () => number) {
  const cols = 9;
  const rows = 12;
  const cell = W / cols;
  const pad = cell * 0.3;
  const cells: React.ReactNode[] = [];
  const ax = Math.floor(r() * cols);
  const ay = Math.floor(r() * rows);
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const isAccent = cx === ax && cy === ay;
      const o = 0.12 + r() * 0.5;
      cells.push(
        <rect
          key={`${cx}-${cy}`}
          x={cx * cell + pad}
          y={cy * (H / rows) + pad}
          width={cell - pad * 2}
          height={H / rows - pad * 2}
          fill={isAccent ? TONE.accent : TONE.deep}
          opacity={isAccent ? 1 : o}
        />
      );
    }
  }
  return (
    <>
      <rect width={W} height={H} fill={TONE.base} />
      {cells}
    </>
  );
}

function Monolith(r: () => number) {
  const w1 = W * (0.26 + r() * 0.12);
  const w2 = W * (0.16 + r() * 0.1);
  const x1 = W * (0.1 + r() * 0.08);
  const x2 = x1 + w1 + W * 0.06;
  const h1 = H * (0.6 + r() * 0.22);
  const h2 = H * (0.4 + r() * 0.3);
  return (
    <>
      <rect width={W} height={H} fill={TONE.base} />
      <rect x={0} y={H * 0.72} width={W} height={H * 0.28} fill={TONE.raise} />
      <rect x={x1} y={H - h1} width={w1} height={h1} fill={TONE.deep} opacity={0.85} />
      <rect x={x2} y={H - h2} width={w2} height={h2} fill={TONE.raise} />
      <rect
        x={x2}
        y={H - h2}
        width={w2}
        height={h2}
        fill="none"
        stroke={TONE.deep}
        strokeWidth={1.25}
        opacity={0.6}
      />
      <rect x={x1} y={H - h1} width={w1} height={10} fill={TONE.accent} />
    </>
  );
}

function Orbit(r: () => number) {
  const cx = W * 0.5;
  const cy = H * 0.5;
  const rings = [0.18, 0.29, 0.4].map((k) => Math.min(W, H) * k);
  const angle = r() * Math.PI * 2;
  const onRing = rings[1];
  return (
    <>
      <rect width={W} height={H} fill={TONE.base} />
      <circle cx={cx} cy={cy} r={rings[2] * 1.3} fill={TONE.raise} opacity={0.6} />
      {rings.map((rad, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={rad}
          fill="none"
          stroke={TONE.deep}
          strokeWidth={i === 1 ? 1.5 : 1}
          opacity={0.55}
        />
      ))}
      <circle
        cx={cx + Math.cos(angle) * onRing}
        cy={cy + Math.sin(angle) * onRing}
        r={14}
        fill={TONE.accent}
      />
      <line
        x1={cx}
        y1={0}
        x2={cx}
        y2={H}
        stroke={TONE.line}
        strokeWidth={1}
        opacity={0.8}
      />
    </>
  );
}

const MOTIFS: Record<Motif, (r: () => number) => React.ReactNode> = {
  aperture: Aperture,
  strata: Strata,
  field: Field,
  monolith: Monolith,
  orbit: Orbit,
};

export function Artwork({
  src,
  alt,
  motif,
  seed,
  className = "",
  sizes = "100vw",
  priority = false,
}: {
  src?: string;
  alt: string;
  motif: Motif;
  seed: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className={`object-cover ${className}`}
      />
    );
  }

  const draw = MOTIFS[motif] ?? Aperture;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={`size-full ${className}`}
      role="img"
      aria-label={alt}
    >
      {draw(rng(seed))}
    </svg>
  );
}
