"use client";

/**
 * GLITCH WORD
 * ---------------------------------------------------------------------------
 * A marquee word that periodically misregisters into its blue and red
 * separations — the hero portrait's gesture, transposed onto type.
 *
 * At rest this is a plain text span and nothing else exists in the DOM. When
 * `active` flips true, two aria-hidden channel copies mount on top: one blue,
 * one red, each carrying the line-screen halftone mask and each shearing the
 * opposite direction. They fade out and unmount when the burst ends.
 *
 * Why mount-on-demand rather than render the layers permanently at opacity 0:
 * the band renders roughly thirty word instances across two tracks and two
 * duplicated copies. Three permanent layers each would be ninety masked
 * elements compositing on every frame of a marquee that never stops moving.
 * Only one word glitches at a time, so only one word pays for it.
 *
 * The channels sit in an `inline-block` wrapper with the base text, so they
 * inherit its exact metrics — no measuring, and no chance of the ghost
 * drifting out of alignment at a different clamp size.
 *
 * The `bottom-[-0.35em]` is load-bearing. A mask clips to the border box, so
 * any ink outside a channel's box is masked away entirely — and every caller
 * sets a line-height at or under 1em, which puts a descender roughly 0.15em
 * below the box. At `inset-0` the channels were exactly the wrapper's height,
 * so the tail of a "y" or "g" was clipped off both of them and only the plain
 * base text showed through there: the word tore, its descenders did not.
 * Extending the box downward brings that ink back inside the mask.
 *
 * Only the bottom moves. `top` stays pinned because these are absolutely
 * positioned boxes whose text is laid out from their own top edge — raising
 * the top would carry the channel text up with it and break registration with
 * the base word, which is the one thing this effect cannot afford. Latin caps
 * and ascenders sit inside the box at these line-heights, so the top does not
 * need the same treatment.
 */
export function GlitchWord({
  word,
  active,
  /** Length of one burst, in ms. Kept in sync with the caller's timer. */
  duration,
}: {
  word: string;
  active: boolean;
  duration: number;
}) {
  const secs = `${duration}ms`;

  /** Shared by both channels — only the shear keyframe and colour differ. */
  const channel = (which: "blue" | "red"): React.CSSProperties => ({
    color: which === "blue" ? "var(--block-blue)" : "var(--block-red)",
    animation: [
      `glitch-shear-${which} ${secs} steps(1, end) 1`,
      `halftone-shuffle ${secs} steps(1, end) 1`,
      `glitch-fade ${secs} linear 1`,
    ].join(", "),
  });

  /**
   * The blend has to flip with the theme, so it is a class rather than part
   * of the inline style above.
   *
   * `screen` is what rebuilds a lighter core where the two channels overlap,
   * the same way the portrait compositor does — but screen is additive, and
   * `1-(1-s)(1-1)` is 1 for every source colour, so against a white page it
   * resolves to white and the channels disappear completely. That is what the
   * effect was doing in light mode: the glyph washed out instead of tearing.
   *
   * `multiply` is the subtractive mirror of it and the physically honest one
   * here — misregistered ink on white paper multiplies. Against white it
   * returns the channel colour at full strength, and where the two channels
   * overlap they darken into a combined core, which is the same gesture as
   * screen's lighter core, read the other way up.
   */
  const blendClass = "mix-blend-screen light:mix-blend-multiply";

  return (
    <span className="relative inline-block">
      {word}

      {active && (
        <>
          <span
            aria-hidden="true"
            className={`u-halftone-lines absolute inset-x-0 top-0 bottom-[-0.35em] whitespace-nowrap ${blendClass}`}
            style={channel("blue")}
          >
            {word}
          </span>
          <span
            aria-hidden="true"
            className={`u-halftone-lines absolute inset-x-0 top-0 bottom-[-0.35em] whitespace-nowrap ${blendClass}`}
            style={channel("red")}
          >
            {word}
          </span>
        </>
      )}
    </span>
  );
}
