import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "resume-studio-theme";

function readTheme() {
  if (typeof document !== "undefined") {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "night" || attr === "day") return attr;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "night" || stored === "day") return stored;
  } catch {
    /* ignore */
  }
  return "day";
}

export function useTheme() {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "night" ? "day" : "night"));
  }, []);

  return { theme, toggleTheme, isNight: theme === "night" };
}
