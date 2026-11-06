"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type AdminThemeMode = "light" | "dark" | "system";

interface AdminThemeContextType {
  theme: AdminThemeMode;
  resolvedTheme: "light" | "dark";
  isDark: boolean;
  setTheme: (mode: AdminThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "chanir_admin_theme";

const AdminThemeContext = createContext<AdminThemeContextType>({
  theme: "system",
  resolvedTheme: "light",
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AdminThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as AdminThemeMode | null;
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeState(stored);
      }
    } catch {
      // LocalStorage access may fail in restricted/iframe environments
    }
    setMounted(true);
  }, []);

  // Listen to system prefers-color-scheme & resolve active theme
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const resolve = (currentMode: AdminThemeMode) => {
      if (currentMode === "dark") return "dark";
      if (currentMode === "light") return "light";
      return media.matches ? "dark" : "light";
    };

    setResolvedTheme(resolve(theme));

    const handleMediaChange = () => {
      if (theme === "system") {
        setResolvedTheme(media.matches ? "dark" : "light");
      }
    };

    media.addEventListener("change", handleMediaChange);
    return () => media.removeEventListener("change", handleMediaChange);
  }, [theme]);

  const setTheme = useCallback((newTheme: AdminThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  }, [resolvedTheme, setTheme]);

  const isDark = resolvedTheme === "dark";

  return (
    <AdminThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        isDark,
        setTheme,
        toggleTheme,
      }}
    >
      <div
        className={mounted && isDark ? "dark contents-wrapper" : "contents-wrapper"}
        data-admin-theme={mounted ? resolvedTheme : "light"}
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}

