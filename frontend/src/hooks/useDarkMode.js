import { useEffect, useState } from "react";

/**
 * useDarkMode
 * -----------
 * Manages dark mode state, persists the preference in memory for the
 * session, applies/removes the `dark` class on <html> for Tailwind's
 * `darkMode: "class"` strategy, and respects the user's OS preference
 * on first load.
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark((prev) => !prev);

  return { isDark, toggleDarkMode };
}
