import { featuredProjects } from "@/lib/projects";
import { ProjectStack } from "@/components/work/ProjectStack";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function SelectedWork() {
  return (
    <section id="work" className="relative z-10 scroll-mt-24">
      {/* The header is the one shelled part of this section — everything
          below deliberately breaks the shell so the colour blocks can run
          edge to edge, but the masthead still needs to sit on the grid like
          every other section's does. */}
      <div className="u-shell pt-16 md:pt-24">
        <SectionHeader index="01" title="Work" />
      </div>

      <ProjectStack projects={featuredProjects} />
    </section>
  );
}
