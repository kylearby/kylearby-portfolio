import Link from "next/link";
import { navigation, site } from "@/lib/site";
import { AnimatedLink } from "@/components/ui/AnimatedLink";
import { MapPin } from "@/components/ui/Icons";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <div className="u-shell py-10">
        <div className="u-grid gap-y-8">
          <div className="col-span-6 md:col-span-5">
            {/* Moved over from the hero — same badge, same flicker, just
                relocated so the masthead reads as one line, not two. */}
            <p className="u-mono inline-flex items-center gap-1.5 text-fg-subtle">
              <span
                aria-hidden="true"
                className="text-accent motion-safe:[animation:flicker_5s_ease-in-out_infinite]"
              >
                <MapPin size={15} className="shrink-0" />
              </span>
              {site.locationShort} {year}
            </p>
            <p className="mt-2 max-w-[34ch] text-sm text-fg-muted">
              Working with clients worldwide. Currently based in {site.location}{" "}
              — {site.timezoneLabel}.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="col-span-3 md:col-span-3 md:col-start-7"
          >
            <p className="u-meta mb-3 text-fg-subtle">Index</p>
            {/* The -my-3/py-3 pair grows each hit area to the 44px touch
                minimum without disturbing the visual rhythm of the list. */}
            <ul className="space-y-1.5">
              {navigation.map((item) => (
                <li key={item.href}>
                  <AnimatedLink
                    href={`/${item.href}`}
                    className="-my-3 py-3 text-sm text-fg-muted transition-colors hover:text-fg"
                  >
                    {item.label}
                  </AnimatedLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-3 md:col-span-3 md:col-start-10">
            <p className="u-meta mb-3 text-fg-subtle">Elsewhere</p>
            <ul className="space-y-1.5">
              {site.socials.map((s) => (
                <li key={s.label}>
                  <AnimatedLink
                    href={s.href}
                    external
                    className="-my-3 py-3 text-sm text-fg-muted transition-colors hover:text-fg"
                  >
                    {s.label}
                  </AnimatedLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line-soft pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="u-meta text-fg-subtle">
            © {year} {site.name}
          </p>
          <p className="u-meta text-fg-subtle">
            Designed &amp; built in-house
          </p>
        </div>
      </div>
    </footer>
  );
}
