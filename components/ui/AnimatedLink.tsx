"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
  /** Adds the underline sweep. Off for links that carry their own affordance. */
  underline?: boolean;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">;

/**
 * Link with an underline that sweeps out from the left on hover and focus.
 * Pure CSS transform on a pseudo-free span — no layout is touched, so it
 * cannot cause reflow.
 */
export function AnimatedLink({
  href,
  children,
  className = "",
  external = false,
  underline = true,
  ...rest
}: Props) {
  const inner = (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      {underline && (
        <span
          aria-hidden="true"
          className="
            absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0
            bg-current transition-transform duration-[450ms]
            ease-[cubic-bezier(0.16,1,0.3,1)]
            group-hover/link:origin-left group-hover/link:scale-x-100
            group-focus-visible/link:origin-left group-focus-visible/link:scale-x-100
          "
        />
      )}
    </span>
  );

  const classes = `group/link inline-block ${className}`;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...rest}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {inner}
    </Link>
  );
}
