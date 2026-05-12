// src/context/ThemeContext.tsx
// Centralised theme management. Default = LIGHT MODE.
//
// Boot sequence:
//   1. resolveInitialTheme() runs synchronously in useState initialiser.
//      Returns true ONLY if localStorage explicitly contains 'dark'.
//      null / missing / 'light' / anything else → false (light mode).
//   2. useEffect fires after first render and unconditionally reconciles
//      document.documentElement — removes any stale 'dark' class that the
//      old DashboardLayout code may have added before this context mounted.
//   3. requestAnimationFrame adds 'theme-ready' so CSS transitions only
//      activate after paint, preventing a white→black flash for returning
//      dark-mode users.

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function resolveInitialTheme(): boolean {
  try {
    return localStorage.getItem('eduguard-theme') === 'dark';
  } catch {
    return false; // SSR / private browsing guard
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(resolveInitialTheme);

  useEffect(() => {
    const root = document.documentElement;

    // Always reconcile — overwrites any stale class from old code
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Enable smooth transitions only after first paint
    const raf = requestAnimationFrame(() => {
      root.classList.add('theme-ready');
    });
    return () => cancelAnimationFrame(raf);
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      try {
        localStorage.setItem('eduguard-theme', next ? 'dark' : 'light');
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}