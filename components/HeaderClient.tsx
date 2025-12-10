"use client";

import { useEffect, useState } from "react";
import Header from "./Header";

function getCookie(name: string) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}
function setCookie(name: string, value: string, days = 365) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
}

function applyThemeToHtml(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
  // helps browser render form controls correctly in each theme
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

export default function HeaderClient({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const saved = getCookie("theme"); // "dark" | "light" | null
    const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? true;
    const isDark = saved ? saved === "dark" : systemDark;

    setDarkMode(isDark);
    applyThemeToHtml(isDark);
  }, []);

  const handleSetDarkMode = (val: boolean) => {
    setDarkMode(val);
    setCookie("theme", val ? "dark" : "light");
    applyThemeToHtml(val);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <Header darkMode={darkMode} setDarkMode={handleSetDarkMode} />
      {children}
    </div>
  );
}
