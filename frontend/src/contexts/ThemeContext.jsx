import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [selectedTheme, setSelectedTheme] = useState("system");
  const [resolvedTheme, setResolvedTheme] = useState("light");

  const applyTheme = useCallback((theme) => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      root.classList.add("dark");
    } else {
      root.removeAttribute("data-theme");
      root.classList.remove("dark");
    }
  }, []);

  const getSystemTheme = useCallback(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);

  const resolveTheme = useCallback((theme) => {
    if (theme === "system") {
      return getSystemTheme();
    }
    return theme;
  }, [getSystemTheme]);

  // originEvent: optional click/pointer event used to anchor the radial reveal animation
  const handleThemeChange = useCallback((newTheme, originEvent) => {
    const resolved = resolveTheme(newTheme);

    // Set the origin point for the radial reveal (falls back to viewport center)
    const x = originEvent ? (originEvent.clientX / window.innerWidth) * 100 : 50;
    const y = originEvent ? (originEvent.clientY / window.innerHeight) * 100 : 50;
    document.documentElement.style.setProperty("--theme-x", `${x}%`);
    document.documentElement.style.setProperty("--theme-y", `${y}%`);

    const commitTheme = () => {
      setSelectedTheme(newTheme);
      setResolvedTheme(resolved);
      applyTheme(resolved);
      try {
        localStorage.setItem("scholaros_theme", newTheme);
      } catch {
        // localStorage may be unavailable, ignore silently
      }
    };

    // Use the View Transition API for a smooth radial reveal when supported.
    // Falls back to an instant (but still CSS-transitioned) theme swap otherwise.
    if (document.startViewTransition) {
      document.startViewTransition(commitTheme);
    } else {
      commitTheme();
    }
  }, [resolveTheme, applyTheme]);

  useEffect(() => {
    let saved;
    try {
      saved = localStorage.getItem("scholaros_theme");
    } catch {
      // localStorage may be unavailable, ignore silently
    }
    const initialTheme = saved || "system";
    setSelectedTheme(initialTheme);
    const initialResolved = resolveTheme(initialTheme);
    setResolvedTheme(initialResolved);
    applyTheme(initialResolved);
  }, [resolveTheme, applyTheme]);

  useEffect(() => {
    if (selectedTheme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      const newResolved = e.matches ? "dark" : "light";
      // Smoothly animate system-driven changes too
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          setResolvedTheme(newResolved);
          applyTheme(newResolved);
        });
      } else {
        setResolvedTheme(newResolved);
        applyTheme(newResolved);
      }
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [selectedTheme, applyTheme]);

  const value = {
    selectedTheme,
    resolvedTheme,
    setTheme: handleThemeChange,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};