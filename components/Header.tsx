"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Header({
  darkMode,
  setDarkMode,
}: {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Tabs" },
    { href: "/prelab", label: "Pre-lab Questions" },
    { href: "/escape-room", label: "Escape Room" },
    { href: "/coding-races", label: "Coding Races" },
    { href: "/about", label: "About" },
  ];

  return (
    <header
      style={{
        borderBottom: "1px solid #4d4d4d",
        marginBottom: "1rem",
        background: darkMode ? "#111" : "#f9f9f9",
        color: darkMode ? "#fff" : "#000",
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      {/* Top Row: Title + Student No. + Dark Mode Toggle */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1.5rem",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Assignment 1</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>Student No: 22586549</p>
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.25rem",
            }}
            title="Toggle Dark Mode"
          >
            {darkMode ? "🌙" : "☀️"}
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.5rem 1.5rem",
          borderTop: "1px solid #333",
        }}
      >
        {/* Desktop Links */}
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                textDecoration: "none",
                color:
                  pathname === link.href
                    ? darkMode
                      ? "#4dabf7"
                      : "#0070f3"
                    : darkMode
                    ? "#fff"
                    : "#000",
                fontWeight: pathname === link.href ? "bold" : "normal",
                transition: "color 0.2s ease",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Hamburger Menu (visible on mobile) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: darkMode ? "#fff" : "#000",
            display: "block", // show on mobile
          }}
        >
          ☰
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "0.75rem 1.5rem",
            borderTop: "1px solid #333",
            background: darkMode ? "#111" : "#f9f9f9",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: "0.5rem 0",
                textDecoration: "none",
                color:
                  pathname === link.href
                    ? darkMode
                      ? "#4dabf7"
                      : "#0070f3"
                    : darkMode
                    ? "#fff"
                    : "#000",
                fontWeight: pathname === link.href ? "bold" : "normal",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}