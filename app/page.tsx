"use client";

import { useState } from "react";

export default function Home() {
  const [tabs, setTabs] = useState([
    { id: 1, title: "Step 1", content: "Step 1: Do something" },
    { id: 2, title: "Step 2", content: "Step 2: Install VSCode, Chrome, Node..." },
    { id: 3, title: "Step 3", content: "Step 3: Continue setup" },
  ]);
  const [activeTab, setActiveTab] = useState(2);
  const [darkMode, setDarkMode] = useState(true);
  const [output, setOutput] = useState("");
  const [tabsHeader, setTabsHeader] = useState("Tabs Headers");
  const [editingHeader, setEditingHeader] = useState(false); // NEW state

  // Add new tab
  const addTab = () => {
    if (tabs.length < 15) {
      const newId = tabs.length + 1;
      setTabs([...tabs, { id: newId, title: `Step ${newId}`, content: `Step ${newId}: ...` }]);
    }
  };

  // Remove last tab
  const removeTab = () => {
    if (tabs.length > 1) {
      setTabs(tabs.slice(0, -1));
      if (activeTab > tabs.length - 1) setActiveTab(tabs.length - 1);
    }
  };

  // Generate full HTML5 + JS output
  const generateOutput = () => {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Tabs Output</title>
</head>
<body style="font-family:sans-serif; padding:1rem;">
  <h1>${tabsHeader}</h1>
`;

    tabs.forEach((tab) => {
      html += `
  <div>
    <h3 style="margin:0;">${tab.title}</h3>
    <p>${tab.content}</p>
  </div>`;
    });

    html += `
  <script type="text/javascript">
    window.onload = function() {
      alert("Hello! Your generated tabs are ready.");
    };
  </script>
</body>
</html>`;

    setOutput(html);
  };

  // Copy output to clipboard
  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    alert("Output copied to clipboard!");
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr 1fr",
        gap: "1rem",
        padding: "1rem",
        background: darkMode ? "#222" : "#fff",
        color: darkMode ? "#fff" : "#000",
        minHeight: "75vh",
      }}
    >
      {/* Tabs Headers */}
      <aside>
        {/* Editable Tabs Header */}
        <div style={{ marginBottom: "0.5rem" }}>
          {editingHeader ? (
            <input
              type="text"
              value={tabsHeader}
              autoFocus
              onChange={(e) => setTabsHeader(e.target.value)}
              onBlur={() => setEditingHeader(false)}
              style={{
                padding: "0.25rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                width: "100%",
              }}
            />
          ) : (
            <h2
              style={{ cursor: "pointer", margin: 0 }}
              onClick={() => setEditingHeader(true)}
            >
              {tabsHeader}
            </h2>
          )}
        </div>

        <div>
          <button onClick={addTab}>+</button>
          <button onClick={removeTab}>-</button>
        </div>
        <ul>
          {tabs.map((tab) => (
            <li
              key={tab.id}
              style={{
                cursor: "pointer",
                fontWeight: activeTab === tab.id ? "bold" : "normal",
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.title}
            </li>
          ))}
        </ul>
      </aside>

      {/* Tabs Content */}
      <section>
        <h2>Tabs Content</h2>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            minHeight: "200px",
          }}
        >
          <textarea
            value={tabs.find((t) => t.id === activeTab)?.content || ""}
            onChange={(e) =>
              setTabs(
                tabs.map((t) =>
                  t.id === activeTab ? { ...t, content: e.target.value } : t
                )
              )
            }
            style={{
              width: "100%",
              height: "100%",
              background: "transparent",
              color: darkMode ? "#fff" : "#000",
              border: "none",
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
              fontSize: "1rem",
            }}
          />
        </div>
      </section>

      {/* Output Section */}
      <aside>
        <h2>Output</h2>
        <label>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />{" "}
          Dark Mode
        </label>
        <div style={{ marginTop: "1rem" }}>
          <button
            onClick={generateOutput}
            style={{
              padding: "0.5rem 1rem",
              background: "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginRight: "0.5rem",
            }}
          >
            Generate Output
          </button>
          {output && (
            <button
              onClick={copyOutput}
              style={{
                padding: "0.5rem 1rem",
                background: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Copy
            </button>
          )}
        </div>

        {/* Output Box (always visible, scrollable) */}
        <pre
          style={{
            marginTop: "1rem",
            padding: "1rem",
            border: "1px solid #ccc",
            background: darkMode ? "#111" : "#f9f9f9",
            color: darkMode ? "#0f0" : "#000",
            fontSize: "0.9rem",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            minHeight: "200px",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {output || "No output yet..."}
        </pre>
      </aside>
    </div>
  );
}