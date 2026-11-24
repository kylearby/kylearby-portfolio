import { site } from "@/lib/site";

/**
 * Availability status. The pulse is CSS-only (transform + opacity), and the
 * state is carried by the text as well as the dot — colour alone never
 * communicates anything here.
 */
export function Availability({ className = "" }: { className?: string }) {
  return (
    <span
      className={`
        inline-flex items-center gap-2.5 rounded-full border border-line
        bg-surface/60 py-1.5 pl-3 pr-4 backdrop-blur-sm ${className}
      `}
    >
      {/* Red rather than the primary blue — a live/focal dot, same role as
          the cursor's centre dot, not a structural link colour. */}
      <span className="relative grid size-2 place-items-center">
        <span
          aria-hidden="true"
          className="absolute size-2 rounded-full bg-accent-2 motion-safe:[animation:pulse-ring_2.4s_cubic-bezier(0.4,0,0.6,1)_infinite]"
        />
        <span className="relative size-2 rounded-full bg-accent-2" />
      </span>
      <span className="u-meta text-fg-muted">
        {site.available ? site.availableFor : "Not currently available"}
      </span>
    </span>
  );
}
