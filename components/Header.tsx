"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
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
        borderBottom: "1px solid #4d4d4dff",
        marginBottom: "1rem",
        background: "#111",
        color: "#fff",
      }}
    >
      {/* Top Row: Title + Student No. */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1.5rem",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Assignment 1</h1>
        <p style={{ margin: 0, fontSize: "0.9rem" }}>Student No: 22586549</p>
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
                color: pathname === link.href ? "#4dabf7" : "#fff",
                fontWeight: pathname === link.href ? "bold" : "normal",
                transition: "color 0.2s ease",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Hamburger Menu (for mobile) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: "#fff",
            display: "none", // hide on desktop
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
            background: "#111",
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
                color: pathname === link.href ? "#4dabf7" : "#fff",
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