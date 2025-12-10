"use client";

import { useState } from "react";

type Props = {
  label: string;
  onClick: () => void;
  icon?: { src: string; alt: string };
  fallback?: string; // emoji fallback
  disabled?: boolean;
  variant?: "ghost" | "primary";
};

export default function IconButton({
  label,
  onClick,
  icon,
  fallback = "🔘",
  disabled,
  variant = "ghost",
}: Props) {
  const [imgOk, setImgOk] = useState(true);

  const base =
    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition " +
    "focus:outline-none focus:ring-2 focus:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50";

  const styles =
    variant === "primary"
      ? "bg-white text-black hover:bg-white/90 border border-white/20"
      : "bg-white/10 hover:bg-white/15 border border-white/15 text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`${base} ${styles}`}
    >
      {icon && imgOk ? (
        <img
          src={icon.src}
          alt={icon.alt}
          className="h-[18px] w-[18px]"
          onError={() => setImgOk(false)}
        />
      ) : (
        <span aria-hidden="true">{fallback}</span>
      )}
      <span>{label}</span>
    </button>
  );
}
