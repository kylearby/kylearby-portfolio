"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/lib/projects";
import { blockFor } from "@/lib/projects";
import { EASE_OUT_EXPO, viewportOnce } from "@/lib/motion";

/**
 * The full catalogue as a ledger. Mono throughout, one rule per row, and a
 * swatch carrying that project's block colour so the index and the blocks
 * above read as the same system.
 */
export function ProjectIndex({ projects }: { projects: Project[] }) {
  const reduce = useReducedMotion();

  return (
    <ul className="border-t border-line">
      {projects.map((project, i) => {
        const block = blockFor(i);
        return (
          <motion.li
            key={project.slug}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{
              duration: 0.45,
              delay: Math.min(i * 0.03, 0.24),
              ease: EASE_OUT_EXPO,
            }}
            className="border-b border-line-soft"
          >
            <Link
              href={`/work/${project.slug}`}
              className="
                group/row flex items-center gap-4 py-4
                transition-[padding-left] duration-500
                ease-[cubic-bezier(0.16,1,0.3,1)]
                hover:pl-3
              "
            >
              <span
                aria-hidden="true"
                className="size-2 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover/row:scale-150"
                style={{ backgroundColor: block.bg }}
              />
              <span className="u-mono tabular w-8 shrink-0 text-fg-subtle">
                {project.index}
              </span>

              <span className="min-w-0 flex-1">
                <span className="u-mono block truncate text-fg transition-opacity duration-300 group-hover/row:opacity-70">
                  {project.client} — {project.title}
                </span>
              </span>

              <span className="u-mono hidden w-44 shrink-0 lowercase text-fg-muted md:block">
                {project.category}
              </span>
              <time
                className="u-mono tabular hidden w-24 shrink-0 text-fg-subtle md:block"
                dateTime={project.year.slice(0, 4)}
              >
                {project.year}
              </time>
              <span
                aria-hidden="true"
                className="
                  u-mono shrink-0 text-fg-subtle transition-transform duration-500
                  ease-[cubic-bezier(0.16,1,0.3,1)]
                  motion-safe:group-hover/row:translate-x-1
                "
              >
                ↗
              </span>
            </Link>
          </motion.li>
        );
      })}
    </ul>
  );
}
