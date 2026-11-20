"use client";

import { Settings } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between px-5 pt-4 pb-2">
      <h1
        className="text-[28px] tracking-[-0.02em] font-[800]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        coy<span className="text-pink">.</span>
      </h1>
      <button
        className="w-12 h-12 rounded-full bg-lavender/50 flex items-center justify-center hover:bg-lavender transition-colors"
        aria-label="Settings"
      >
        <Settings size={22} className="text-ink" />
      </button>
    </header>
  );
}
