import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blockForSlug, getAdjacent, getProject, projects } from "@/lib/projects";
import { site } from "@/lib/site";
import { Artwork } from "@/components/ui/Artwork";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { ProjectGallery } from "@/components/work/ProjectGallery";
import { PageTransition } from "@/components/chrome/PageTransition";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@/components/ui/Icons";

type Params = { params: Promise<{ slug: string }> };

/** Every project is a static route — nothing is rendered on demand. */
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project not found" };

  const title = `${project.client} — ${project.title}`;
  return {
    title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      title: `${title} — ${site.name}`,
      description: project.summary,
      url: `${site.url}/work/${project.slug}`,
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { prev, next } = getAdjacent(slug);
  // The detail page opens in the same colour as the block that was clicked.
  const block = blockForSlug(slug);

  return (
    <PageTransition>
      <article className="pt-28 md:pt-32">
        {/* Masthead — carried in the project's own block colour, so opening a
            detail page continues the colour you just clicked. */}
        <header
          className="u-grain relative w-full"
          style={{ backgroundColor: block.bg, color: block.fg }}
        >
          <div className="u-shell py-10 md:py-14">
            <Link
              href="/#work"
              className="group/back u-mono -my-3 inline-flex items-center gap-2.5 py-3 transition-opacity hover:opacity-60"
            >
              <ArrowLeft
                size={15}
                className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover/back:-translate-x-1"
              />
              <span>all work</span>
            </Link>

            <div
              className="u-grid mt-12 items-end gap-y-8 border-t pt-5 md:mt-20"
              style={{ borderColor: block.rule }}
            >
              <div className="col-span-6 md:col-span-8">
                <p className="u-mono mb-6 lowercase opacity-70">
                  {project.index} — {project.category} — {project.year}
                </p>
                <h1 className="font-display text-block font-medium lowercase">
                  <span className="block opacity-45">{project.client}</span>
                  <span className="block">{project.title}</span>
                </h1>
              </div>

              <p className="u-mono col-span-6 max-w-[42ch] opacity-80 md:col-span-3 md:col-start-10">
                {project.intro}
              </p>
            </div>
          </div>
        </header>

        {/* Lead plate */}
        <Reveal y={0} className="u-shell mt-10 md:mt-14">
          <div className="u-grain relative aspect-[16/10] overflow-hidden bg-surface ring-1 ring-inset ring-line/60 md:aspect-[21/9]">
            <Artwork
              src={project.cover}
              motif={project.motif}
              seed={project.seed}
              alt={`${project.client} — ${project.title}, lead image`}
              sizes="92vw"
              priority
            />
          </div>
        </Reveal>

        {/* Facts + narrative */}
        <div className="u-shell py-section">
          <div className="u-grid gap-y-14">
            <div className="col-span-6 md:col-span-3">
              <Reveal stagger={0.06}>
                {project.facts.map((fact) => (
                  <RevealItem
                    key={fact.label}
                    as="div"
                    className="border-b border-line-soft py-3.5"
                  >
                    <dl>
                      <dt className="u-meta text-fg-subtle">{fact.label}</dt>
                      <dd className="mt-1 text-sm text-fg">{fact.value}</dd>
                    </dl>
                  </RevealItem>
                ))}
              </Reveal>

              <Reveal delay={0.1} className="mt-8">
                <p className="u-meta mb-3 text-fg-subtle">Role</p>
                <ul className="flex flex-wrap gap-2">
                  {project.roles.map((role) => (
                    <li
                      key={role}
                      className="rounded-full border border-line px-3 py-1 text-sm text-fg-muted"
                    >
                      {role}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <div className="col-span-6 md:col-span-7 md:col-start-6">
              <Reveal stagger={0.08} className="space-y-6">
                {project.body.map((paragraph, i) => (
                  <RevealItem key={i} as="p">
                    <span
                      className={
                        i === 0
                          ? "text-lede text-fg"
                          : "text-base leading-relaxed text-fg-muted"
                      }
                    >
                      {paragraph}
                    </span>
                  </RevealItem>
                ))}
              </Reveal>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <section aria-label="Project gallery" className="u-shell pb-section">
          <ProjectGallery frames={project.gallery} />
        </section>

        {/* Prev / next */}
        <nav
          aria-label="More projects"
          className="border-t border-line bg-surface/40"
        >
          <div className="u-shell py-14 md:py-20">
            <p className="u-meta mb-8 text-fg-subtle">Continue</p>
            <div className="u-grid gap-y-8">
              {prev && (
                <Link
                  href={`/work/${prev.slug}`}
                  data-cursor="Previous"
                  className="group/nav col-span-6 md:col-span-5"
                >
                  <span className="u-meta flex items-center gap-2 text-fg-subtle">
                    <ArrowLeft
                      size={14}
                      className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover/nav:-translate-x-1"
                    />
                    Previous
                  </span>
                  <span className="mt-2 block font-display text-title font-medium tracking-[-0.03em] transition-colors duration-300 group-hover/nav:text-accent">
                    {prev.client} — {prev.title}
                  </span>
                </Link>
              )}

              {next && (
                <Link
                  href={`/work/${next.slug}`}
                  data-cursor="Next"
                  className="group/nav col-span-6 md:col-span-5 md:col-start-8 md:text-right"
                >
                  <span className="u-meta flex items-center gap-2 text-fg-subtle md:justify-end">
                    Next
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover/nav:translate-x-1"
                    />
                  </span>
                  <span className="mt-2 block font-display text-title font-medium tracking-[-0.03em] transition-colors duration-300 group-hover/nav:text-accent">
                    {next.client} — {next.title}
                  </span>
                </Link>
              )}
            </div>

            <div className="mt-14 border-t border-line-soft pt-8">
              <a
                href={`mailto:${site.email}`}
                data-cursor="Email"
                className="group/cta -my-2 inline-flex items-baseline gap-3 py-2 font-display text-title font-medium tracking-[-0.03em] transition-colors hover:text-accent"
              >
                Start a project
                <ArrowUpRight
                  size={22}
                  className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover/cta:translate-x-1 motion-safe:group-hover/cta:-translate-y-1"
                />
              </a>
            </div>
          </div>
        </nav>
      </article>
    </PageTransition>
  );
}
