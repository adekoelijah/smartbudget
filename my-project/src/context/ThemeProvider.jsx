import { useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./theme-context";

const STORAGE_KEY = "theme";

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || "system";
  });

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "system" || !stored
      ? getSystemTheme()
      : stored;
  });

  useEffect(() => {
    const root = document.documentElement;

    const apply = (mode) => {
      root.classList.toggle("dark", mode === "dark");
      setResolvedTheme(mode);
    };

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");

      const update = () => apply(getSystemTheme());

      update();
      media.addEventListener("change", update);

      return () => media.removeEventListener("change", update);
    }

    apply(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
    }),
    [theme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;