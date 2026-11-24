import { site } from "@/lib/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { Magnetic } from "@/components/ui/Magnetic";
import { AnimatedLink } from "@/components/ui/AnimatedLink";
import { ArrowUpRight } from "@/components/ui/Icons";

export function Contact() {
  return (
    <section id="contact" className="u-shell scroll-mt-24 py-section">
      <SectionHeader index="03" title="Contact" />

      <div className="u-grid gap-y-14">
        <div className="col-span-6 md:col-span-8">
          {/* A statement, not a heading — the section heading is the eyebrow. */}
          <p className="font-display text-headline font-medium">
            <SplitText text="Let's connect!" as="span" />
          </p>

          {/* The address is the primary call to action, set at display size. */}
          <Reveal delay={0.2} className="mt-10">
            <Magnetic strength={0.16}>
              <a
                href={`mailto:${site.email}`}
                data-cursor="Email"
                className="
                  group/mail inline-block font-display font-medium
                  text-[clamp(1.75rem,5.5vw,4.25rem)] leading-[1.05]
                  tracking-[-0.045em] transition-colors duration-300
                  hover:text-accent
                "
              >
                <span className="relative inline-block break-all">
                  {site.email}
                  <span
                    aria-hidden="true"
                    className="
                      absolute -bottom-1 left-0 h-[2px] w-full origin-right
                      scale-x-0 bg-accent transition-transform duration-[600ms]
                      ease-[cubic-bezier(0.16,1,0.3,1)]
                      group-hover/mail:origin-left group-hover/mail:scale-x-100
                      group-focus-visible/mail:origin-left
                      group-focus-visible/mail:scale-x-100
                    "
                  />
                </span>
              </a>
            </Magnetic>
          </Reveal>
        </div>

        <div className="col-span-6 md:col-span-3 md:col-start-10">
          <Reveal>
            <h3 className="u-meta border-b border-line pb-3 text-fg-subtle">
              Elsewhere
            </h3>
          </Reveal>
          <Reveal stagger={0.07} className="mt-1">
            {site.socials.map((social) => (
              <RevealItem key={social.label} as="div">
                <AnimatedLink
                  href={social.href}
                  external
                  underline={false}
                  className="
                    group/social flex items-center justify-between gap-4
                    border-b border-line-soft py-4
                    transition-[padding-left] duration-500
                    ease-[cubic-bezier(0.16,1,0.3,1)] hover:pl-2
                  "
                >
                  <span>
                    <span className="block text-base text-fg transition-colors duration-300 group-hover/social:text-accent">
                      {social.label}
                    </span>
                    <span className="u-meta text-fg-subtle">{social.handle}</span>
                  </span>
                  <ArrowUpRight
                    size={17}
                    className="shrink-0 text-fg-subtle transition-[transform,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/social:text-accent motion-safe:group-hover/social:translate-x-0.5"
                  />
                </AnimatedLink>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
