"use client";

/**
 * GRID LINES
 * ---------------------------------------------------------------------------
 * The column grid, made visible. Hairlines sit on the boundaries between
 * columns and run the full height of the viewport, so every block on the page
 * is visibly measured against the same structure.
 *
 * Fixed rather than per-section: the rules stay put while content scrolls past
 * them, which reads as a sheet of graph paper the page is drawn on rather than
 * decoration attached to any one block.
 *
 * Purely decorative, so it is hidden from assistive tech and never intercepts
 * a pointer.
 */
export function GridLines({ columns = 12 }: { columns?: number }) {
  // Boundaries only — the outer edges are the container's own padding.
  const inner = Array.from({ length: columns - 1 }, (_, i) => i + 1);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="u-shell relative h-full">
        <div className="relative h-full">
          {inner.map((i) => (
            <span
              key={i}
              className={`
                absolute top-0 h-full w-px bg-line-soft
                ${i % 2 === 0 ? "" : "hidden md:block"}
              `}
              style={{ left: `${(i / columns) * 100}%` }}
            />
          ))}
          {/* Container edges, slightly stronger than the inner boundaries. */}
          <span className="absolute inset-y-0 left-0 w-px bg-line" />
          <span className="absolute inset-y-0 right-0 w-px bg-line" />
        </div>
      </div>
    </div>
  );
}
