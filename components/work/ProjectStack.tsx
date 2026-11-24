"use client";

import { useRef } from "react";
import { useScroll } from "framer-motion";
import type { Project } from "@/lib/projects";
import { ProjectBlock } from "@/components/work/ProjectBlock";

/**
 * PROJECT STACK
 * ---------------------------------------------------------------------------
 * Holds the featured blocks as a stack of sticky cards: each one pins under
 * the header, and the next card scrolls up over it. Buried cards shrink a
 * little and lift a little, so their top edges stay visible above the card
 * being read — a stack of folders rather than a pile of full-bleed panels
 * replacing one another.
 *
 * The scroll progress is measured once here, on the container, rather than
 * per card. A card cannot derive this from its own geometry: it has to keep
 * shrinking as *every subsequent* card lands on top of it, which is a fact
 * about the whole stack's scroll, not about that card's trip through the
 * viewport. Each block gets the container's progress and its own index and
 * works out its own depth from those.
 *
 * Passing a MotionValue down is deliberate — it updates outside React, so the
 * six blocks re-render zero times across the entire scroll.
 */
export function ProjectStack({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={ref} className="relative">
      {projects.map((project, i) => (
        <ProjectBlock
          key={project.slug}
          project={project}
          index={i}
          total={projects.length}
          progress={scrollYProgress}
        />
      ))}

      {/* Trailing slot, one card tall. Without it the container's bottom
          reaches the viewport before the last card ever reaches its pin
          point, so every card unsticks at once and the whole stack slides
          off the top — the last project would flash past having never been
          the one on top. This is not empty space on screen: the last card
          stays pinned over it for exactly the scroll distance it adds. */}
      <div aria-hidden="true" className="h-[calc(100dvh-188px)]" />
    </div>
  );
}
