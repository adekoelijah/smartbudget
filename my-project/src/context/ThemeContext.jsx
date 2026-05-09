

// import { createContext, useContext, useEffect, useState } from "react";

// const ThemeContext = createContext(null);

// export const ThemeProvider = ({ children }) => {
//   const [theme, setTheme] = useState("light");

//   // 🔥 INIT THEME ONLY ONCE (safe hydration)
//   useEffect(() => {
//     const savedTheme = localStorage.getItem("theme");

//     if (savedTheme === "dark" || savedTheme === "light") {
//       setTheme(savedTheme);
//     } else {
//       const prefersDark = window.matchMedia(
//         "(prefers-color-scheme: dark)"
//       ).matches;

//       setTheme(prefersDark ? "dark" : "light");
//     }
//   }, []);

//   // 🔥 APPLY THEME TO DOCUMENT
//   useEffect(() => {
//     const root = document.documentElement;

//     root.classList.remove("light", "dark");
//     root.classList.add(theme);

//     localStorage.setItem("theme", theme);
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme((prev) => (prev === "light" ? "dark" : "light"));
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = () => {
//   const context = useContext(ThemeContext);

//   if (!context) {
//     throw new Error("useTheme must be used inside ThemeProvider");
//   }

//   return context;
// };

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

/**
 * 🌙 Theme + 🎨 Color System (Enterprise SaaS)
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [color, setColor] = useState("indigo");

  // load saved settings
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedColor = localStorage.getItem("color");

    if (savedTheme) setTheme(savedTheme);
    if (savedColor) setColor(savedColor);
  }, []);

  // apply theme + palette
  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(theme);

    root.style.setProperty("--primary", getColor(color));

    localStorage.setItem("theme", theme);
    localStorage.setItem("color", color);
  }, [theme, color]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const changeColor = (newColor) => {
    setColor(newColor);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        color,
        toggleTheme,
        changeColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

const getColor = (color) => {
  const map = {
    indigo: "#6366f1",
    emerald: "#10b981",
    rose: "#f43f5e",
    amber: "#f59e0b",
    slate: "#64748b",
  };

  return map[color] || map.indigo;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
};