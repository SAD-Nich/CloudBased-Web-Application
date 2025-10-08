"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PathTracker() {
  const pathname = usePathname();

  useEffect(() => {
    document.cookie = `lastPath=${encodeURIComponent(pathname)}; path=/; max-age=${60 * 60 * 24 * 180}`;
  }, [pathname]);

  return null;
}