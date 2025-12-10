"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  initialSeconds?: number;
  onExpire?: () => void;
};

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

export default function Timer({ initialSeconds = 180, onExpire }: Props) {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

  const [mins, setMins] = useState(Math.floor(initialSeconds / 60));
  const [secs, setSecs] = useState(initialSeconds % 60);

  const intervalRef = useRef<number | null>(null);
  const expiredRef = useRef(false);

  // Reset when stage/time changes
  useEffect(() => {
    setTotalSeconds(initialSeconds);
    setRemaining(initialSeconds);
    setMins(Math.floor(initialSeconds / 60));
    setSecs(initialSeconds % 60);
    setRunning(false);
    expiredRef.current = false;

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [initialSeconds]);

  // Tick loop
  useEffect(() => {
    if (!running) return;

    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        // if we hit zero on this tick, stop + expire
        if (prev <= 1) {
          // stop interval
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          setRunning(false);

          if (!expiredRef.current) {
            expiredRef.current = true;
            // IMPORTANT: call parent callback AFTER state update, not inside updater logic
            setTimeout(() => onExpire?.(), 0);
          }

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, onExpire]);

  const mmss = useMemo(() => {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [remaining]);

  const applyTime = () => {
    const m = clampInt(mins, 0, 99);
    const s = clampInt(secs, 0, 59);
    const t = m * 60 + s;

    setTotalSeconds(t);
    setRemaining(t);
    setRunning(false);
    expiredRef.current = false;

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    console.log("[telemetry] timer_set", { ts: Date.now(), totalSeconds: t });
  };

  const start = () => {
    if (remaining <= 0) return;
    console.log("[telemetry] timer_start", { ts: Date.now(), remaining });
    setRunning(true);
  };

  const pause = () => {
    console.log("[telemetry] timer_pause", { ts: Date.now(), remaining });
    setRunning(false);
  };

  const reset = () => {
    console.log("[telemetry] timer_reset", { ts: Date.now(), totalSeconds });
    setRemaining(totalSeconds);
    setRunning(false);
    expiredRef.current = false;

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const btn =
    "rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold " +
    "text-white hover:bg-white/15 transition focus:outline-none focus:ring-2 focus:ring-white/30 " +
    "disabled:opacity-50 disabled:hover:bg-white/10";

  return (
    <div className="rounded-2xl border border-white/10 bg-black/[0.45] p-4 backdrop-blur">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xs text-white/70">Timer</div>
          <div className="mt-1 font-mono text-4xl font-extrabold tracking-wider">{mmss}</div>
        </div>

        <div className="flex gap-2">
          <button className={btn} onClick={start} disabled={running || remaining <= 0}>
            Start
          </button>
          <button className={btn} onClick={pause} disabled={!running}>
            Pause
          </button>
          <button className={btn} onClick={reset}>
            Reset
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
        <input
          type="number"
          value={mins}
          onChange={(e) => setMins(Number(e.target.value))}
          min={0}
          max={99}
          className="w-full rounded-xl border border-white/15 bg-black/[0.35] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Minutes"
        />
        <span className="text-white/60">:</span>
        <input
          type="number"
          value={secs}
          onChange={(e) => setSecs(Number(e.target.value))}
          min={0}
          max={59}
          className="w-full rounded-xl border border-white/15 bg-black/[0.35] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Seconds"
        />
        <button className={btn} onClick={applyTime}>
          Apply
        </button>
      </div>
    </div>
  );
}
