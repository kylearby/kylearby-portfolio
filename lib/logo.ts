/**
 * LOGO GEOMETRY
 * Measured from KYLEARBY_LOGO_Asset 1.png by scripts/split-logo.js — not
 * eyeballed. If the source artwork is ever re-exported, re-run the splitter
 * and paste its reported boxes here rather than nudging these numbers.
 *
 * The two words overlap by ~20px vertically (the descenders of Kyle/Arby run
 * past the cap line of Santos), which is why they are separate masks.
 */

export type LogoBox = { x: number; y: number; w: number; h: number };

export const LOGO_FRAME = { w: 2000, h: 744 };

export const LOGO_NAME: LogoBox = { x: 23, y: 0, w: 1977, h: 431 };
export const LOGO_SANTOS: LogoBox = { x: 0, y: 411, w: 1367, h: 333 };

export const LOGO_SRC = {
  name: "/brand/logo-name.png",
  santos: "/brand/logo-santos.png",
} as const;

/** Shared mask declaration — every layer of the logo is painted this way. */
export function maskStyle(src: string): React.CSSProperties {
  return {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };
}

/** Position a measured box as percentages of a given frame. */
export function boxStyle(box: LogoBox, frame: { w: number; h: number }) {
  const pc = (v: number, total: number) => `${(v / total) * 100}%`;
  return {
    left: pc(box.x, frame.w),
    top: pc(box.y, frame.h),
    width: pc(box.w, frame.w),
    height: pc(box.h, frame.h),
  };
}
