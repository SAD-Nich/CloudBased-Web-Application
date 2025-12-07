"use client";

import React, { useEffect, useMemo, useState } from "react";
import Timer from "../../components/Timer";
import IconButton from "../../components/IconButton";

type Stage = {
  id: string;
  title: string;
  prompt: string;
  hint: string;
  timeSeconds: number;
  inputLabel: string;
  placeholder: string;
  validate: (answer: string) => { ok: boolean; message: string };
};

type Scenario = {
  id: string;
  name: string;
  backgroundUrl: string;
  stages: Stage[];
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

const SCENARIOS: Scenario[] = [
  {
    id: "format-lock",
    name: "Format Lock (Easy)",
    backgroundUrl: "/escape-room-bg.jpg",
    stages: [
      {
        id: "s1",
        title: "Stage 1 — The Cursor Key",
        prompt:
          "Sticky note: “The password is the shortcut to open DevTools on Chrome.” Enter the shortcut (Windows).",
        hint: "Hint: It includes Ctrl + Shift + ...",
        timeSeconds: 120,
        inputLabel: "Shortcut",
        placeholder: "e.g., Ctrl+Shift+I",
        validate: (ans) => {
          const a = normalize(ans).replace(/\s/g, "");
          const ok = a === "ctrl+shift+i" || a === "ctrl+shift+j";
          return { ok, message: ok ? "Correct — the lock clicks open." : "Nope. Try again." };
        },
      },
      {
        id: "s2",
        title: "Stage 2 — The Data Scroll",
        prompt:
          'A console log shows: {"code": "  042  "}. Convert it to an integer (no spaces, no leading zeros). What is it?',
        hint: "Trim spaces, remove leading zeros (then it's an integer).",
        timeSeconds: 150,
        inputLabel: "Integer value",
        placeholder: "Enter final number",
        validate: (ans) => {
          const ok = normalize(ans) === "42";
          return { ok, message: ok ? "Nice. The second lock opens." : "Not quite. Think: 042 => ?" };
        },
      },
      {
        id: "s3",
        title: "Stage 3 — The Range Gate",
        prompt:
          "Final gate: Enter the only valid range for this puzzle: numbers from 0 to 1000 inclusive. Format: 0-1000.",
        hint: "Inclusive means endpoints allowed.",
        timeSeconds: 180,
        inputLabel: "Range",
        placeholder: "0-1000",
        validate: (ans) => {
          const a = normalize(ans).replace(/\s/g, "");
          const ok = a === "0-1000";
          return { ok, message: ok ? "You escaped! ✅" : "Range format or values are wrong." };
        },
      },
    ],
  },
  {
    id: "debug-crypt",
    name: "Debug Crypt (Medium)",
    backgroundUrl: "/escape-room-bg.jpg",
    stages: [
      {
        id: "m1",
        title: "Stage 1 — The HTTP Door",
        prompt: "A note reads: “Success is not 404.” What is the standard HTTP status code for OK?",
        hint: "Most common success code.",
        timeSeconds: 120,
        inputLabel: "Status code",
        placeholder: "e.g., 200",
        validate: (ans) => {
          const ok = normalize(ans) === "200";
          return { ok, message: ok ? "Door unlocked." : "Nope — think of OK." };
        },
      },
      {
        id: "m2",
        title: "Stage 2 — The JSON Riddle",
        prompt: "Enter valid JSON for an object with key 'a' set to number 1.",
        hint: "JSON uses double quotes for keys.",
        timeSeconds: 180,
        inputLabel: "JSON",
        placeholder: `{"a":1}`,
        validate: (ans) => {
          try {
            const obj = JSON.parse(ans);
            const ok = obj && typeof obj === "object" && obj.a === 1;
            return { ok, message: ok ? "Valid JSON. Proceed." : "Parsed, but wrong content." };
          } catch {
            return { ok: false, message: "That isn't valid JSON." };
          }
        },
      },
      {
        id: "m3",
        title: "Stage 3 — The Boolean Seal",
        prompt: "Enter the JavaScript boolean literal that means “yes”.",
        hint: "Not 'Yes', not 'TRUE' — literal.",
        timeSeconds: 150,
        inputLabel: "Boolean literal",
        placeholder: "true / false",
        validate: (ans) => {
          const ok = normalize(ans) === "true";
          return { ok, message: ok ? "Escaped! ✅" : "Wrong literal." };
        },
      },
    ],
  },
];

function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function SmallActionButton({
  label,
  onClick,
  disabled,
  leftIcon,
  isDark,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
        "focus:outline-none focus:ring-2",
        disabled ? "cursor-not-allowed opacity-60" : "hover:shadow-sm active:translate-y-[1px]",
        isDark
          ? "border-white/15 bg-white/10 text-white hover:bg-white/15 focus:ring-white/20"
          : "border-black/15 bg-white text-zinc-900 hover:bg-zinc-50 focus:ring-black/10",
      ].join(" ")}
    >
      {leftIcon ? <span className="text-base leading-none">{leftIcon}</span> : null}
      <span>{label}</span>
    </button>
  );
}

export default function EscapeRoomClient() {
  const [isDark, setIsDark] = useState(true);

  // Read cookie and keep in sync WITHOUT changing other files.
  useEffect(() => {
    const read = () => {
      const saved = getCookie("theme"); // "dark" | "light" | null
      const shouldBeDark = saved ? saved === "dark" : window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
      setIsDark(!!shouldBeDark);
    };

    read();
    const id = window.setInterval(read, 300); // simple + reliable
    return () => window.clearInterval(id);
  }, []);

  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const scenario = useMemo(() => SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0], [scenarioId]);

  const [stageIndex, setStageIndex] = useState(0);
  const stage = scenario.stages[stageIndex];

  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [failed, setFailed] = useState(false);

  const resetRun = () => {
    console.log("[telemetry] escape_reset", { ts: Date.now(), scenarioId: scenario.id });
    setStageIndex(0);
    setAnswer("");
    setStatus(null);
    setShowHint(false);
    setFailed(false);
  };

  const changeScenario = (id: string) => {
    setScenarioId(id);
    console.log("[telemetry] scenario_change", { ts: Date.now(), scenarioId: id });
    setStageIndex(0);
    setAnswer("");
    setStatus(null);
    setShowHint(false);
    setFailed(false);
  };

  const check = () => {
    if (failed) return;
    const res = stage.validate(answer);
    console.log("[telemetry] stage_check", { ts: Date.now(), scenarioId: scenario.id, stageId: stage.id, ok: res.ok });
    setStatus({ ok: res.ok, msg: res.message });
  };

  const next = () => {
    if (failed) return;
    if (!status?.ok) {
      setStatus({ ok: false, msg: "Solve the stage before moving on." });
      return;
    }
    if (stageIndex < scenario.stages.length - 1) {
      console.log("[telemetry] stage_next", { ts: Date.now(), scenarioId: scenario.id, from: stage.id });
      setStageIndex(stageIndex + 1);
      setAnswer("");
      setStatus(null);
      setShowHint(false);
    }
  };

  const onExpire = () => {
    console.log("[telemetry] timer_expired", { ts: Date.now(), scenarioId: scenario.id, stageId: stage.id });
    setFailed(true);
    setStatus({ ok: false, msg: "⏰ Time’s up! Reset the run to try again." });
  };

  const isLast = stageIndex === scenario.stages.length - 1;

  // Theme tokens
  const wrapText = isDark ? "text-white" : "text-zinc-900";
  const subText = isDark ? "text-white/75" : "text-zinc-600";
  const chipBg = isDark ? "bg-black/40" : "bg-white/75";
  const chipBorder = isDark ? "border-white/10" : "border-black/10";
  const cardBg = isDark ? "bg-black/45" : "bg-white/85";
  const cardBorder = isDark ? "border-white/10" : "border-black/10";
  const card2Bg = isDark ? "bg-white/6" : "bg-zinc-50/80";
  const inputBorder = isDark ? "border-white/15" : "border-black/15";
  const focusRing = isDark ? "focus:ring-white/20" : "focus:ring-black/10";

  const overlay = isDark
    ? `
      radial-gradient(900px 420px at 15% 0%, rgba(255,255,255,0.10), transparent 60%),
      radial-gradient(900px 420px at 85% 10%, rgba(255,255,255,0.06), transparent 65%),
      linear-gradient(rgba(0,0,0,0.78), rgba(0,0,0,0.92))
    `
    : `
      radial-gradient(900px 420px at 15% 0%, rgba(255,255,255,0.95), transparent 60%),
      radial-gradient(900px 420px at 85% 10%, rgba(255,255,255,0.85), transparent 65%),
      linear-gradient(rgba(255,255,255,0.70), rgba(255,255,255,0.92))
    `;

  return (
    <div
      className={`min-h-[78vh] transition-colors ${wrapText}`}
      style={{
        backgroundImage: `${overlay}, url(${scenario.backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs backdrop-blur ${chipBg} ${chipBorder}`}
            >
              <span className="font-semibold">Escape Room</span>
              <span className={isDark ? "text-white/40" : "text-black/40"}>•</span>
              <span>
                Stage {stageIndex + 1}/{scenario.stages.length}
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{scenario.name}</h1>
            <p className={`mt-1 ${subText}`}>Solve each stage before the timer ends. Use hints if you’re stuck.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs ${subText}`}>Scenario</span>
              <select
                value={scenarioId}
                onChange={(e) => changeScenario(e.target.value)}
                className={`rounded-xl border px-3 py-2 text-sm outline-none ${focusRing} ${chipBorder} ${chipBg}`}
                style={{ color: "inherit" }}
              >
                {SCENARIOS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <SmallActionButton
              label="Reset Run"
              onClick={resetRun}
              disabled={false}
              leftIcon="🔁"
              isDark={isDark}
            />
          </div>
        </div>

        {/* Main grid */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          {/* Stage Card */}
          <div className={`rounded-2xl border p-5 backdrop-blur ${cardBg} ${cardBorder}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-xl font-extrabold sm:text-2xl">{stage.title}</h2>
                <p className={`mt-2 leading-relaxed ${isDark ? "text-white/85" : "text-zinc-700"}`}>{stage.prompt}</p>
              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                <SmallActionButton
                  label={showHint ? "Hide Hint" : "Show Hint"}
                  onClick={() => setShowHint((v) => !v)}
                  disabled={failed}
                  leftIcon="💡"
                  isDark={isDark}
                />
                <SmallActionButton
                  label="Check"
                  onClick={check}
                  disabled={failed}
                  leftIcon="✅"
                  isDark={isDark}
                />
                <SmallActionButton
                  label={isLast ? "Finish" : "Next"}
                  onClick={next}
                  disabled={failed}
                  leftIcon="➡️"
                  isDark={isDark}
                />
              </div>
            </div>

            {showHint && (
              <div className={`mt-4 rounded-2xl border p-4 ${card2Bg} ${cardBorder}`}>
                <div className={`text-xs font-extrabold ${subText}`}>Hint</div>
                <div className={`mt-1 ${isDark ? "text-white/85" : "text-zinc-700"}`}>{stage.hint}</div>
              </div>
            )}

            <div className="mt-5">
              <label className={`block text-xs ${subText}`}>{stage.inputLabel}</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    check();
                  }
                }}
                placeholder={stage.placeholder}
                disabled={failed}
                rows={4}
                className={`mt-2 w-full resize-y rounded-xl border px-4 py-3 text-sm outline-none disabled:opacity-60 ${inputBorder} ${focusRing}`}
                style={{
                  background: isDark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.95)",
                  color: "inherit",
                }}
              />
              <p className={`mt-2 text-xs ${subText}`}>
                Tip: Enter makes a new line. Use <span className="font-semibold">Ctrl+Enter</span> to check.
              </p>
            </div>

            {status && (
              <div
                className={[
                  "mt-4 rounded-2xl border p-4",
                  status.ok ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10",
                ].join(" ")}
              >
                <div className="font-semibold">
                  {status.ok ? "✅ Correct" : "❌ Not yet"}{" "}
                  <span className={`font-normal ${isDark ? "text-white/85" : "text-zinc-700"}`}>{status.msg}</span>
                </div>
                {status.ok && isLast && <div className="mt-2 font-extrabold">🏁 Run complete!</div>}
              </div>
            )}

            {failed && (
              <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                ⏰ Time’s up. Reset the run to retry.
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* If your Timer component is hard-coded dark, this keeps it readable in light mode */}
            <div style={isDark ? undefined : { filter: "invert(1) hue-rotate(180deg)" }}>
              <Timer initialSeconds={stage.timeSeconds} onExpire={onExpire} />
            </div>

            <div className={`rounded-2xl border p-5 backdrop-blur ${cardBg} ${cardBorder}`}>
              <div className={`text-xs ${subText}`}>Progress</div>

              <div className="mt-3 space-y-2">
                {scenario.stages.map((st, idx) => {
                  const done = idx < stageIndex || (idx === stageIndex && status?.ok);
                  const current = idx === stageIndex;

                  return (
                    <div
                      key={st.id}
                      className={[
                        "flex items-center justify-between gap-3 rounded-xl border px-3 py-2",
                        done
                          ? "border-green-500/20 bg-green-500/10"
                          : current
                          ? isDark
                            ? "border-white/15 bg-white/10"
                            : "border-black/10 bg-zinc-50/80"
                          : isDark
                          ? "border-white/10 bg-black/25 opacity-70"
                          : "border-black/10 bg-white/60 opacity-70",
                      ].join(" ")}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-sm">{done ? "✅" : current ? "🟦" : "⬜"}</span>
                        <span className={current ? "truncate text-sm font-extrabold" : "truncate text-sm font-semibold"}>
                          {st.title}
                        </span>
                      </div>
                      <span className={`shrink-0 text-xs ${subText}`}>{formatMMSS(st.timeSeconds)}</span>
                    </div>
                  );
                })}
              </div>

              <p className={`mt-4 text-xs ${subText}`}>
                Add SVG icons in{" "}
                <code className={`rounded px-1 ${isDark ? "bg-white/10" : "bg-black/10"}`}>/public/icons</code> to
                replace emoji.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
