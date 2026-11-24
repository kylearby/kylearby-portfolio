"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "@/components/ui/Icons";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle, ready } = useTheme();
  const reduce = useReducedMotion();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      // Announce the action, not the current state.
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      className={`
        relative grid size-11 place-items-center rounded-full
        text-fg transition-colors duration-300
        hover:bg-surface-2 active:scale-95
        ${className}
      `}
    >
      {/* Invisible until hydrated, so the icon can never contradict the theme. */}
      <span
        className="relative grid size-5 place-items-center transition-opacity duration-200"
        style={{ opacity: ready ? 1 : 0 }}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={isDark ? "moon" : "sun"}
            className="absolute inset-0 grid place-items-center"
            initial={reduce ? false : { opacity: 0, rotate: -45, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, rotate: 45, scale: 0.7 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {isDark ? <Moon size={19} /> : <Sun size={19} />}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
