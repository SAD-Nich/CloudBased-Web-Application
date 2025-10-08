"use client";

import { useState } from "react";
import Header from "./Header";

export default function HeaderClient({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div
      style={{
        background: darkMode ? "#111" : "#fff",
        color: darkMode ? "#fff" : "#000",
        transition: "background 0.3s ease, color 0.3s ease",
        minHeight: "100vh",
      }}
    >
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      {children}
    </div>
  );
}