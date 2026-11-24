"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Frame } from "@/lib/projects";
import { Artwork } from "@/components/ui/Artwork";
import { EASE_OUT_EXPO, viewportOnce } from "@/lib/motion";

const RATIO: Record<Frame["ratio"], string> = {
  "4/5": "aspect-[4/5]",
  "3/4": "aspect-[3/4]",
  "1/1": "aspect-square",
  "16/10": "aspect-[16/10]",
  "21/9": "aspect-[21/9]",
};

/**
 * Project gallery. Wide frames take the full measure, portrait frames pair up —
 * so the page keeps an editorial rhythm without needing a bespoke layout per
 * project.
 */
export function ProjectGallery({ frames }: { frames: Frame[] }) {
  const reduce = useReducedMotion();

  return (
    <div className="u-grid gap-y-8 md:gap-y-14">
      {frames.map((frame, i) => {
        const wide = frame.ratio === "16/10" || frame.ratio === "21/9";
        return (
          <motion.figure
            key={`${frame.caption}-${i}`}
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.75, ease: EASE_OUT_EXPO }}
            className={`col-span-6 ${wide ? "md:col-span-12" : "md:col-span-6"}`}
          >
            <div
              className={`u-grain relative overflow-hidden bg-surface ring-1 ring-inset ring-line/60 ${RATIO[frame.ratio]}`}
            >
              <motion.div
                initial={reduce ? false : { clipPath: "inset(0 0 100% 0)", scale: 1.1 }}
                whileInView={{ clipPath: "inset(0 0 0% 0)", scale: 1 }}
                viewport={viewportOnce}
                transition={{ duration: 1.25, ease: EASE_OUT_EXPO }}
                className="absolute inset-0"
              >
                <Artwork
                  src={frame.src}
                  motif={frame.motif}
                  seed={frame.seed}
                  alt={frame.caption}
                  sizes={
                    wide
                      ? "(max-width: 768px) 100vw, 92vw"
                      : "(max-width: 768px) 100vw, 46vw"
                  }
                />
              </motion.div>
            </div>
            <figcaption className="u-meta mt-3 flex items-baseline justify-between gap-4 text-fg-subtle">
              <span>{frame.caption}</span>
              <span className="tabular">
                {String(i + 1).padStart(2, "0")}/{String(frames.length).padStart(2, "0")}
              </span>
            </figcaption>
          </motion.figure>
        );
      })}
    </div>
  );
}
