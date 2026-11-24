"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { useEffect, useState } from "react";
import { navigation, site } from "@/lib/site";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Close, Menu } from "@/components/ui/Icons";
import { Logo } from "@/components/ui/Logo";
import { EASE_OUT_EXPO } from "@/lib/motion";

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const reduce = useReducedMotion();

  const [condensed, setCondensed] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("top");

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setCondensed(v > 40));

  // Track which section owns the viewport, for the current-location indicator.
  useEffect(() => {
    if (!isHome) return;
    const ids = navigation.map((n) => n.href.replace("#", ""));
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [isHome]);

  // Lock the page behind the mobile sheet, and give Escape a way out.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  const hrefFor = (href: string) => (isHome ? href : `/${href}`);

  return (
    <>
      <a
        href="#main"
        className="
          sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[130]
          focus:bg-fg focus:px-4 focus:py-2 focus:text-bg
        "
      >
        Skip to content
      </a>

      <motion.header
        initial={reduce ? false : { y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT_EXPO }}
        className="fixed inset-x-0 top-0 z-[110]"
      >
        <div
          className={`
            transition-[background-color,backdrop-filter] duration-500
            ease-[cubic-bezier(0.16,1,0.3,1)]
            ${condensed ? "bg-bg/80 backdrop-blur-md" : "bg-transparent"}
          `}
        >
          <nav
            aria-label="Primary"
            className={`
              u-shell flex items-center justify-between
              transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
              ${condensed ? "py-3" : "py-5"}
            `}
          >
            <Link
              href="/"
              className="flex items-center py-2"
              aria-label={`${site.name} — home`}
            >
              {/* The full lockup, moved up from the hero. Widths are set so
                  the "Kyle Arby" line lands at roughly the size the old
                  name-only mark did — the name occupies ~99% of the lockup's
                  width, so the frame width barely changes, but the second
                  line makes the mark about 15px taller. The nav's own padding
                  absorbs that. */}
              <Logo
                variant="lockup"
                className={`
                  transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${condensed ? "w-[94px]" : "w-[112px]"}
                `}
              />
            </Link>

            {/* Desktop */}
            <div className="hidden items-center gap-1 md:flex">
              <ul className="flex items-center gap-1">
                {navigation.map((item) => {
                  const id = item.href.replace("#", "");
                  const isActive = isHome && active === id;
                  return (
                    <li key={item.href}>
                      <Link
                        href={hrefFor(item.href)}
                        aria-current={isActive ? "true" : undefined}
                        className={`
                          u-mono block px-3 py-2 lowercase transition-opacity
                          duration-300 hover:opacity-100
                          ${isActive ? "text-fg opacity-100" : "text-fg-muted opacity-80"}
                        `}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <span aria-hidden="true" className="mx-2 h-4 w-px bg-line" />
              <ThemeToggle />
            </div>

            {/* Mobile */}
            <div className="flex items-center gap-0.5 md:hidden">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="grid size-11 place-items-center text-fg transition-opacity hover:opacity-60 active:scale-95"
              >
                <Menu />
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.22 } }}
            transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
            className="fixed inset-0 z-[125] bg-bg md:hidden"
          >
            <div className="u-shell flex h-full flex-col">
              <div className="flex items-center justify-between py-5">
                <span className="u-mono text-fg-muted">menu</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  autoFocus
                  className="grid size-11 place-items-center text-fg transition-opacity hover:opacity-60 active:scale-95"
                >
                  <Close />
                </button>
              </div>

              <motion.ul
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { delayChildren: 0.06, staggerChildren: 0.05 } },
                }}
                className="mt-4 flex flex-1 flex-col"
              >
                {navigation.map((item, i) => (
                  <motion.li
                    key={item.href}
                    variants={{
                      hidden: reduce ? {} : { opacity: 0, y: 18 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.5, ease: EASE_OUT_EXPO },
                      },
                    }}
                    className="border-b border-line-soft"
                  >
                    <Link
                      href={hrefFor(item.href)}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline justify-between py-4 font-display text-[2rem] font-medium lowercase tracking-[-0.042em]"
                    >
                      {item.label}
                      <span className="u-mono text-fg-subtle">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>

              <div className="py-8">
                <p className="u-mono mb-2 text-fg-subtle">get in touch</p>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-block py-2 font-display text-xl tracking-[-0.035em] text-fg"
                >
                  {site.email}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
