import {
  LOGO_FRAME,
  LOGO_NAME,
  LOGO_SANTOS,
  LOGO_SRC,
  boxStyle,
  maskStyle,
  type LogoBox,
} from "@/lib/logo";

/**
 * LOGO — flat
 * ---------------------------------------------------------------------------
 * The real lockup, split out of KYLEARBY_LOGO_Asset 1.png into two
 * tightly-cropped alpha masks (see public/brand/). Painting the masks with
 * theme tokens rather than shipping baked-in colour means the same artwork
 * works in light and dark — a flat PNG of #181D27 letterforms would vanish on
 * the dark background.
 *
 * See Logo3D for the extruded, draggable version used in the hero.
 */

const FRAME = {
  lockup: LOGO_FRAME,
  name: { w: LOGO_NAME.w, h: LOGO_NAME.h },
};

function Word({
  src,
  box,
  frame,
  colour,
}: {
  src: string;
  box: LogoBox;
  frame: { w: number; h: number };
  colour: string;
}) {
  return (
    <span
      aria-hidden="true"
      className="absolute"
      style={{
        ...boxStyle(box, frame),
        ...maskStyle(src),
        backgroundColor: colour,
      }}
    />
  );
}

export function Logo({
  variant = "lockup",
  className = "",
}: {
  /** `lockup` = both lines. `name` = "Kyle Arby" alone (navigation). */
  variant?: "lockup" | "name";
  className?: string;
}) {
  const isLockup = variant === "lockup";
  const frame = isLockup ? FRAME.lockup : FRAME.name;

  return (
    <span
      role="img"
      aria-label={isLockup ? "Kyle Arby Santos" : "Kyle Arby"}
      className={`relative block ${className}`}
      style={{ aspectRatio: `${frame.w} / ${frame.h}` }}
    >
      <Word
        src={LOGO_SRC.name}
        // Cropped to its own box, the name fills the frame exactly.
        box={isLockup ? LOGO_NAME : { x: 0, y: 0, w: LOGO_NAME.w, h: LOGO_NAME.h }}
        frame={frame}
        colour="var(--c-fg)"
      />
      {isLockup && (
        <Word
          src={LOGO_SRC.santos}
          box={LOGO_SANTOS}
          frame={frame}
          colour="var(--c-logo-2)"
        />
      )}
    </span>
  );
}
