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

export default function HeaderClient({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(true); // default as before
  useEffect(() => {
    const saved = getCookie("theme");
    if (saved === "light") setDarkMode(false);
    if (saved === "dark") setDarkMode(true);
  }, []);
  const handleSetDarkMode = (val: boolean) => {
    setDarkMode(val);
    setCookie("theme", val ? "dark" : "light");
  };

  return (
    <div
      style={{
        background: darkMode ? "#111" : "#fff",
        color: darkMode ? "#fff" : "#000",
        transition: "background 0.3s ease, color 0.3s ease",
        minHeight: "100vh",
      }}
    >
      <Header darkMode={darkMode} setDarkMode={handleSetDarkMode} />
      {children}
    </div>
  );
}