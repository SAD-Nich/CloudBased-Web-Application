export default function Footer() {
  const today = new Date().toLocaleDateString();

  return (
    <footer
      style={{
        padding: "0.5rem 1rem",
        background: "black", // match header background
        borderTop: "1px solid #ccc", // same border style as header
        textAlign: "center",
      }}
    >
      <p style={{ margin: 0 }}>
        © {today} | Nicholaus Santo Agnus Dei | Student ID: 22586549
      </p>
    </footer>
  );
}