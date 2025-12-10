"use client";

import React, { useEffect, useMemo, useState } from "react";
import Timer from "../../components/Timer";

type Stage = {
  id: string;
  title: string;
  prompt: string;
  hint: string;
  timeSeconds: number;
  inputLabel: string;
  placeholder: string;
  validate: (answer: string) => { ok: boolean; message: string };

  iconChoice?: {
    instruction: string;
    correctId: string;
    choices: { id: string; src: string; alt: string; label: string }[];
  };
};

type Scenario = {
  id: string;
  name: string;
  backgroundUrl: string;
  stages: Stage[];
};

type SavedRun = {
  id: string;
  scenarioId: string;
  scenarioName: string;
  runName?: string | null; // displayed name
  success: boolean;
  durationSeconds: number;
  createdAt: string;
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

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

function SvgIcon({
  src,
  alt,
  invert,
  size = 16,
}: {
  src: string;
  alt: string;
  invert?: boolean;
  size?: number;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="block"
      aria-hidden="true"
      style={invert ? { filter: "invert(1)" } : undefined}
    />
  );
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
      {leftIcon ? <span className="leading-none">{leftIcon}</span> : null}
      <span>{label}</span>
    </button>
  );
}

// ===== Scenarios (unchanged) =====
const SCENARIOS: Scenario[] = [
  {
    id: "format-lock",
    name: "Code Vault (Easy)",
    backgroundUrl: "/icons/jackdaw.jpg",
    stages: [
      {
        id: "s1",
        title: "Stage 1 — Format the Function",
        prompt:
          "Format this into valid JavaScript (any style is okay), keeping the same logic:\n\nfunction add(a,b){return a+b}",
        hint: "Must still be a function called add with parameters a and b, returning a + b.",
        timeSeconds: 140,
        inputLabel: "Formatted code",
        placeholder: "Paste your formatted JS code here...",
        validate: (ans) => {
          const a = ans.replace(/\s/g, "").toLowerCase();
          const ok =
            (a.includes("functionadd(a,b){returna+b") ||
              (a.includes("add") && a.includes("=>") && a.includes("a+b"))) &&
            a.includes("a") &&
            a.includes("b");
          return {
            ok,
            message: ok
              ? "Nice formatting — the vault accepts it."
              : "Not yet. Keep the same logic: add(a,b) returns a+b.",
          };
        },
      },
      {
        id: "s2",
        title: "Stage 2 — Port Data (CSV → JSON)",
        prompt:
          "Convert this CSV row into a JSON object (numbers stay numbers):\n\nid,name,price\n42,Keyboard,199.99",
        hint: `Expected keys: id, name, price. Example output: {"id":42,"name":"Keyboard","price":199.99}`,
        timeSeconds: 180,
        inputLabel: "JSON output",
        placeholder: `{"id":42,"name":"Keyboard","price":199.99}`,
        validate: (ans) => {
          try {
            const obj = JSON.parse(ans);
            const ok =
              obj &&
              typeof obj === "object" &&
              obj.id === 42 &&
              obj.name === "Keyboard" &&
              Number(obj.price) === 199.99;
            return {
              ok,
              message: ok ? "Correct conversion — data port complete." : "Valid JSON, but values/keys are wrong.",
            };
          } catch {
            return { ok: false, message: "That isn't valid JSON." };
          }
        },
      },
      {
        id: "s3",
        title: "Stage 3 — Generate 0 to 1000 (Inclusive)",
        prompt:
          "Write JavaScript code that prints ALL numbers from 0 to 1000 inclusive.\n\n(Use for/while—any valid approach.)",
        hint: "Must include 0, must include 1000. A for-loop is easiest.",
        timeSeconds: 220,
        inputLabel: "JavaScript code",
        placeholder: "for (let i = 0; i <= 1000; i++) { console.log(i); }",
        validate: (ans) => {
          const a = ans.toLowerCase().replace(/\s+/g, " ");
          const hasForLoop =
            /for\s*\(\s*let\s+\w+\s*=\s*0\s*;\s*\w+\s*<=\s*1000\s*;\s*\w+\+\+\s*\)/.test(a) &&
            /console\.log\s*\(\s*\w+\s*\)/.test(a);
          const hasWhileLoop =
            /let\s+\w+\s*=\s*0\s*;/.test(a) &&
            /while\s*\(\s*\w+\s*<=\s*1000\s*\)/.test(a) &&
            /console\.log\s*\(\s*\w+\s*\)/.test(a);
          const ok = hasForLoop || hasWhileLoop;
          return {
            ok,
            message: ok ? "Perfect — the range gate opens. ✅" : "Not quite. Make sure it prints 0..1000 inclusive.",
          };
        },
      },
    ],
  },
  {
    id: "debug-crypt",
    name: "Debug Crypt (Medium)",
    backgroundUrl: "/icons/qar.jpg",
    stages: [
      {
        id: "m1",
        title: "Stage 1 — Pick the Debug Symbol",
        prompt:
          "A door panel says: “Select the icon that represents debugging / inspection.”\n\nChoose the correct icon below. Wrong choices will not unlock the door.",
        hint: "Think: debugging = inspect / bug / magnifier. Your correct one is the Debug icon you created.",
        timeSeconds: 60,
        inputLabel: "Icon selection",
        placeholder: "Choose the correct icon...",
        iconChoice: {
          instruction: "Click the correct icon to unlock the debugger.",
          correctId: "debug",
          choices: [
            { id: "Code", src: "/icons/Code.svg", alt: "Code", label: "Code" },
            { id: "git", src: "/icons/Git.svg", alt: "Git", label: "Git" },
            { id: "run and debug", src: "/icons/runanddebug.svg", alt: "Run and Debug", label: "Run and Debug" },
            { id: "debug", src: "/icons/Debug.svg", alt: "Debug", label: "Debug" },
          ],
        },
        validate: (ans) => {
          const ok = normalize(ans) === "debug";
          return { ok, message: ok ? "Correct — debugger unlocked." : "Wrong symbol. The door stays locked." };
        },
      },
      {
        id: "m2",
        title: "Stage 2 — Fix Invalid JSON",
        prompt:
          "This is NOT valid JSON:\n\n{'a':1,}\n\nRewrite it as valid JSON for an object with key \"a\" set to number 1.",
        hint: "Valid JSON uses double quotes, and no trailing commas.",
        timeSeconds: 180,
        inputLabel: "Valid JSON",
        placeholder: `Enter your answer here...`,
        validate: (ans) => {
          try {
            const obj = JSON.parse(ans);
            const ok = obj && typeof obj === "object" && obj.a === 1;
            return { ok, message: ok ? "Valid JSON — crypt seal broken." : "Parsed, but wrong content." };
          } catch {
            return { ok: false, message: "That isn't valid JSON." };
          }
        },
      },
      {
        id: "m3",
        title: "Stage 3 — Parse + Trim",
        prompt:
          'Write ONE line of JavaScript that converts the string "  042  " into the number 42.\n\n(Just paste the line, like parseInt(...) or Number(...).)',
        hint: "Use trim() and parseInt/Number.",
        timeSeconds: 180,
        inputLabel: "One-line JS",
        placeholder: `Remember to use trim() and parseInt/Number...`,
        validate: (ans) => {
          const a = ans.toLowerCase().replace(/\s/g, "");
          const hasTrim = a.includes(".trim()");
          const has042 = a.includes('"042"') || a.includes("'042'") || a.includes("042");
          const hasParse = a.includes("parseint(") || a.includes("number(");
          const ok = hasTrim && has042 && hasParse;
          return {
            ok,
            message: ok ? "Nice — clean parse. You escaped! ✅" : "Not yet. Must include trim() and parseInt/Number.",
          };
        },
      },
    ],
  },
];

export default function EscapeRoomClient() {
  const [isDark, setIsDark] = useState(true);

  // ====== SAVE-TO-DB ======
  const [runStartedAt, setRunStartedAt] = useState<number>(() => Date.now());
  const [stageAnswers, setStageAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // name the run
  const [runName, setRunName] = useState("");

  // ====== VIEW SAVED RUNS ======
  const [savedRuns, setSavedRuns] = useState<SavedRun[]>([]);
  const [loadingRuns, setLoadingRuns] = useState(false);
  const [runsError, setRunsError] = useState<string | null>(null);

  // ====== RENAME SAVED RUNS ======
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");
  const [renameError, setRenameError] = useState<string | null>(null);

  useEffect(() => {
    const read = () => {
      const saved = getCookie("theme");
      const shouldBeDark = saved ? saved === "dark" : window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
      setIsDark(!!shouldBeDark);
    };

    read();
    const id = window.setInterval(read, 300);
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

  const [unlockedByIcon, setUnlockedByIcon] = useState(false);

  async function loadRuns(sid?: string) {
    const scenarioToLoad = sid ?? scenario.id;

    setLoadingRuns(true);
    setRunsError(null);
    try {
      const res = await fetch(`/api/escape-runs?scenarioId=${encodeURIComponent(scenarioToLoad)}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `GET failed (${res.status})`);
      }

      const data = (await res.json()) as any;

      // ✅ normalize “right shape”
      const arr = Array.isArray(data) ? data : [];
      const normalized: SavedRun[] = arr.map((r: any) => ({
        id: String(r.id),
        scenarioId: String(r.scenarioId),
        scenarioName: String(r.scenarioName),
        runName: (r.runName ?? r.notes ?? null) as string | null,
        success: Boolean(r.success),
        durationSeconds: Number(r.durationSeconds ?? 0),
        createdAt: String(r.createdAt),
      }));

      setSavedRuns(normalized);
    } catch (e: any) {
      setSavedRuns([]);
      setRunsError(e?.message ?? "Failed to load saved runs.");
    } finally {
      setLoadingRuns(false);
    }
  }

  useEffect(() => {
    setUnlockedByIcon(false);
    setAnswer("");
    setStatus(null);
    setShowHint(false);
    setSaveError(null);
  }, [scenarioId, stageIndex]);

  useEffect(() => {
    loadRuns(scenarioId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  const resetRun = () => {
    setStageIndex(0);
    setAnswer("");
    setStatus(null);
    setShowHint(false);
    setFailed(false);
    setUnlockedByIcon(false);

    setRunStartedAt(Date.now());
    setStageAnswers({});
    setSavedId(null);
    setSaveError(null);
    setRunName("");

    setRenamingId(null);
    setRenameValue("");
    setRenameError(null);
  };

  const changeScenario = (id: string) => {
    setScenarioId(id);
    setStageIndex(0);
    setAnswer("");
    setStatus(null);
    setShowHint(false);
    setFailed(false);
    setUnlockedByIcon(false);

    setRunStartedAt(Date.now());
    setStageAnswers({});
    setSavedId(null);
    setSaveError(null);
    setRunName("");

    setRenamingId(null);
    setRenameValue("");
    setRenameError(null);
  };

  const check = () => {
    if (failed) return;

    if (!stage.iconChoice) {
      setStageAnswers((prev) => ({ ...prev, [stage.id]: answer }));
    }

    if (stage.iconChoice && !unlockedByIcon) {
      setStatus({ ok: false, msg: "Pick the correct icon first." });
      return;
    }

    const res = stage.validate(answer);
    setStatus({ ok: res.ok, msg: res.message });

    setStageAnswers((prev) => ({ ...prev, [stage.id]: answer }));
  };

  const next = () => {
    if (failed) return;
    if (!status?.ok) {
      setStatus({ ok: false, msg: "Solve the stage before moving on." });
      return;
    }
    if (stageIndex < scenario.stages.length - 1) {
      setStageIndex(stageIndex + 1);
      setAnswer("");
      setStatus(null);
      setShowHint(false);
      setUnlockedByIcon(false);
    }
  };

  const onExpire = () => {
    setFailed(true);
    setStatus({ ok: false, msg: "⏰ Time’s up! Reset the run to try again." });
  };

  const isLast = stageIndex === scenario.stages.length - 1;
  const runComplete = Boolean(isLast && status?.ok);

  async function saveRun() {
    if (!runComplete) return;
    if (saving || savedId) return;

    setSaving(true);
    setSaveError(null);

    try {
      const durationSeconds = Math.max(0, Math.floor((Date.now() - runStartedAt) / 1000));

      const stagesPayload = scenario.stages.map((st, idx) => ({
        stageId: st.id,
        title: st.title,
        index: idx,
        timeLimitSeconds: st.timeSeconds,
        answer: stageAnswers[st.id] ?? (st.id === stage.id ? answer : ""),
      }));

      const name = runName.trim() || null;

      const res = await fetch("/api/escape-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: scenario.id,
          scenarioName: scenario.name,

          // ✅ send both; backend can store in notes OR runName depending on your API
          runName: name,
          notes: name,

          success: true,
          durationSeconds,
          stages: stagesPayload,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Save failed");
      }

      const data = await res.json();
      setSavedId(data.id ?? "saved");

      await loadRuns(scenario.id);
    } catch (e: any) {
      setSaveError(e?.message ?? "Failed to save run.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRun(id: string) {
    try {
      const res = await fetch(`/api/escape-runs?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Delete failed (${res.status})`);
      }
      await loadRuns(scenario.id);
      if (savedId === id) setSavedId(null);
    } catch (e: any) {
      setRunsError(e?.message ?? "Failed to delete run.");
    }
  }

  async function renameRun(id: string) {
    const name = renameValue.trim();
    if (!name) {
      setRenameError("Name cannot be empty.");
      return;
    }
    if (name.length > 60) {
      setRenameError("Name too long (max 60 chars).");
      return;
    }

    setRenameError(null);

    try {
      const res = await fetch(`/api/escape-runs?id=${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }), // ✅ matches the PATCH I gave you
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Rename failed (${res.status})`);
      }

      setRenamingId(null);
      setRenameValue("");
      setRenameError(null);

      await loadRuns(scenario.id);
    } catch (e: any) {
      setRenameError(e?.message ?? "Failed to rename run.");
    }
  }

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

  const checkDisabled = failed || (stage.iconChoice && !unlockedByIcon);

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs backdrop-blur ${chipBg} ${chipBorder}`}>
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
              leftIcon={<SvgIcon src="/icons/Reset.svg" alt="Reset" invert={isDark} />}
              isDark={isDark}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className={`rounded-2xl border p-5 backdrop-blur ${cardBg} ${cardBorder}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-xl font-extrabold sm:text-2xl">{stage.title}</h2>
                <p className={`mt-2 whitespace-pre-wrap leading-relaxed ${isDark ? "text-white/85" : "text-zinc-700"}`}>
                  {stage.prompt}
                </p>

                {stage.iconChoice && (
                  <div className={`mt-4 rounded-2xl border p-5 ${card2Bg} ${cardBorder}`}>
                    <div className="text-sm font-extrabold">{stage.iconChoice.instruction}</div>
                    <div className={`mt-1 text-xs ${subText}`}>
                      {unlockedByIcon ? "✅ Correct icon selected. You may proceed." : "Pick carefully — only one is correct."}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
                      {stage.iconChoice.choices.map((c) => {
                        const selected = answer === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setAnswer(c.id);
                              setStageAnswers((prev) => ({ ...prev, [stage.id]: c.id }));

                              const isCorrect = c.id === stage.iconChoice!.correctId;
                              if (isCorrect) {
                                setUnlockedByIcon(true);
                                setStatus({ ok: true, msg: "Correct icon — debugger unlocked." });
                              } else {
                                setUnlockedByIcon(false);
                                setStatus({ ok: false, msg: "Wrong icon. Try another one." });
                              }
                            }}
                            className={[
                              "rounded-2xl border p-3 min-h-[120px] w-full transition",
                              "focus:outline-none focus:ring-2",
                              selected ? (isDark ? "border-white/30" : "border-black/30") : "",
                              isDark
                                ? "border-white/15 bg-white/10 hover:bg-white/15 focus:ring-white/20"
                                : "border-black/15 bg-white hover:bg-zinc-50 focus:ring-black/10",
                            ].join(" ")}
                          >
                            <div className="flex items-center gap-2">
                              <SvgIcon src={c.src} alt={c.alt} invert={isDark} size={20} />
                              <div className="min-w-0 text-left">
                                <div className="text-sm font-semibold leading-tight break-words">{c.label}</div>
                                <div className={`text-xs ${subText}`}>Click to choose</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                <SmallActionButton
                  label={showHint ? "Hide Hint" : "Show Hint"}
                  onClick={() => setShowHint((v) => !v)}
                  disabled={failed}
                  leftIcon={<SvgIcon src="/icons/Hint.svg" alt="Hint" invert={isDark} />}
                  isDark={isDark}
                />
                <SmallActionButton
                  label="Check"
                  onClick={check}
                  disabled={checkDisabled}
                  leftIcon={<SvgIcon src="/icons/Check.svg" alt="Check" invert={isDark} />}
                  isDark={isDark}
                />
                <SmallActionButton
                  label={isLast ? "Finish" : "Next"}
                  onClick={next}
                  disabled={failed}
                  leftIcon={<SvgIcon src="/icons/Next.svg" alt="Next" invert={isDark} />}
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
                onChange={(e) => {
                  const v = e.target.value;
                  setAnswer(v);
                  if (!stage.iconChoice) {
                    setStageAnswers((prev) => ({ ...prev, [stage.id]: v }));
                  }
                }}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    check();
                  }
                }}
                placeholder={stage.placeholder}
                disabled={failed || !!stage.iconChoice}
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

                {runComplete && (
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="font-extrabold">🏁 Run complete!</div>

                    <div className="flex flex-col gap-1">
                      <label className={`text-xs ${subText}`}>Name this save (optional)</label>
                      <input
                        value={runName}
                        onChange={(e) => setRunName(e.target.value)}
                        placeholder="e.g. First perfect run"
                        className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${focusRing} ${inputBorder}`}
                        style={{
                          background: isDark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.95)",
                          color: "inherit",
                        }}
                        maxLength={60}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={saveRun}
                        disabled={saving || !!savedId}
                        className={[
                          "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                          "focus:outline-none focus:ring-2",
                          saving || savedId ? "cursor-not-allowed opacity-60" : "hover:shadow-sm active:translate-y-[1px]",
                          isDark
                            ? "border-white/15 bg-white/10 text-white hover:bg-white/15 focus:ring-white/20"
                            : "border-black/15 bg-white text-zinc-900 hover:bg-zinc-50 focus:ring-black/10",
                        ].join(" ")}
                      >
                        <SvgIcon src="/icons/Save.svg" alt="Save" invert={isDark} />
                        <span>{savedId ? "Saved ✅" : saving ? "Saving..." : "Save Run"}</span>
                      </button>

                      {saveError && <div className="text-sm text-red-300">{saveError}</div>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {failed && (
              <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                ⏰ Time’s up. Reset the run to retry.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div style={isDark ? undefined : { filter: "invert(1) hue-rotate(180deg)" }}>
              <Timer initialSeconds={stage.timeSeconds} onExpire={onExpire} />
            </div>

            {/* Progress */}
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
            </div>

            {/* Saved Runs */}
            <div className={`rounded-2xl border p-5 backdrop-blur ${cardBg} ${cardBorder}`}>
              <div className={`text-xs ${subText}`}>Saved Runs</div>

              <div className="mt-3 flex items-center justify-between">
                <span className={`text-xs ${subText}`}>Scenario: {scenario.name}</span>
                <button type="button" onClick={() => loadRuns(scenario.id)} className={`text-xs underline ${subText}`}>
                  Refresh
                </button>
              </div>

              {runsError && <div className="mt-2 text-xs text-red-300">{runsError}</div>}

              {loadingRuns ? (
                <div className={`mt-3 text-sm ${subText}`}>Loading…</div>
              ) : savedRuns.length === 0 ? (
                <div className={`mt-3 text-sm ${subText}`}>No saved runs yet.</div>
              ) : (
                <div className="mt-3 space-y-2">
                  {savedRuns.map((r) => (
                    <div
                      key={r.id}
                      className={[
                        "rounded-xl border px-3 py-2",
                        isDark ? "border-white/10 bg-black/25" : "border-black/10 bg-white/60",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">
                            {r.runName?.trim() ? r.runName : r.success ? "✅ Success" : "❌ Failed"}
                          </div>
                          <div className={`text-xs ${subText}`}>{new Date(r.createdAt).toLocaleString()}</div>

                          {/* Rename controls */}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {renamingId === r.id ? (
                              <>
                                <input
                                  value={renameValue}
                                  onChange={(e) => setRenameValue(e.target.value)}
                                  className={`rounded-lg border px-2 py-1 text-xs outline-none ${inputBorder} ${focusRing}`}
                                  style={{
                                    background: isDark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.95)",
                                    color: "inherit",
                                  }}
                                  placeholder="Run name..."
                                  maxLength={60}
                                />
                                <button type="button" onClick={() => renameRun(r.id)} className={`text-xs underline ${subText}`}>
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRenamingId(null);
                                    setRenameValue("");
                                    setRenameError(null);
                                  }}
                                  className={`text-xs underline ${subText}`}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setRenamingId(r.id);
                                  setRenameValue(r.runName?.trim() || "");
                                  setRenameError(null);
                                }}
                                className={`text-xs underline ${subText}`}
                              >
                                Rename
                              </button>
                            )}
                          </div>

                          {renamingId === r.id && renameError && (
                            <div className="mt-1 text-xs text-red-300">{renameError}</div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-sm font-extrabold">{formatMMSS(Number(r.durationSeconds ?? 0))}</div>
                            <div className={`text-xs ${subText}`}>time</div>
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteRun(r.id)}
                            className={[
                              "shrink-0 rounded-lg border px-2 py-1 text-xs font-semibold transition",
                              isDark ? "border-white/15 bg-white/10 hover:bg-white/15" : "border-black/15 bg-white hover:bg-zinc-50",
                            ].join(" ")}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className={`mt-4 text-xs ${subText}`}>
                Make sure <code className={`rounded px-1 ${isDark ? "bg-white/10" : "bg-black/10"}`}>Save.svg</code> exists.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
