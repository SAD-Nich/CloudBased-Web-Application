export default function Footer() {
  // Server-safe, consistent date (avoids server vs client timezone mismatch)
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  return (
    <footer
      style={{
        padding: "0.5rem 1rem",
        textAlign: "center",
        background: "var(--background)",
        color: "var(--foreground)",
        borderTop: "1px solid color-mix(in srgb, var(--foreground) 18%, transparent)",
      }}
    >
      <p style={{ margin: 0 }}>
        © {today} | Nicholaus Santo Agnus Dei | Student ID: 22586549
      </p>
    </footer>
  );
}
