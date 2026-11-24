"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "ka-theme";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
  ready: boolean;
}>({ theme: "dark", toggle: () => {}, ready: false });

export const useTheme = () => useContext(ThemeContext);

/**
 * Blocking script. Runs before first paint so the correct theme is already on
 * <html> when the body renders — no flash, no layout shift.
 *
 * V2 inverts V1: black is the design's default ground, so the marker class is
 * `light` and dark needs no class at all. The system preference is still
 * honoured, but an unset preference lands on dark rather than light.
 */
export const themeScript = `
(function(){
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    var theme = stored || (prefersLight ? 'light' : 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [ready, setReady] = useState(false);

  // Adopt whatever the blocking script already decided.
  useEffect(() => {
    const isLight = document.documentElement.classList.contains("light");
    setTheme(isLight ? "light" : "dark");
    setReady(true);
  }, []);

  // Follow the OS only while the user has not made an explicit choice.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(STORAGE_KEY)) return;
      const next: Theme = e.matches ? "light" : "dark";
      setTheme(next);
      document.documentElement.classList.toggle("light", next === "light");
      document.documentElement.style.colorScheme = next;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "light" ? "dark" : "light";
      document.documentElement.classList.toggle("light", next === "light");
      document.documentElement.style.colorScheme = next;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* private mode — the choice just will not persist */
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, ready }}>
      {children}
    </ThemeContext.Provider>
  );
}
