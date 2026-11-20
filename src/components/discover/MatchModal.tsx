"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { PublicProfile } from "@/lib/repository";
import { getFallbackAvatarSvg, ACCENT_COLORS } from "@/lib/avatar";

interface MatchModalProps {
  match: { profile: PublicProfile; matchedAt: string } | null;
  onKeepSwiping: () => void;
  onViewMatches: () => void;
}

export function MatchModal({
  match,
  onKeepSwiping,
  onViewMatches,
}: MatchModalProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && match) {
        onKeepSwiping();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [match, onKeepSwiping]);

  if (!match) return null;

  const { profile } = match;
  const accent = ACCENT_COLORS[profile.accent] || ACCENT_COLORS.peach;
  const photoSrc = imgError
    ? getFallbackAvatarSvg(profile.name, accent.bg)
    : profile.photoUrl;

  // Lightweight decorative confetti shapes
  const confettiShapes = [
    { top: "12%", left: "15%", rotate: 18, color: "var(--pink)", size: 14, shape: "circle" },
    { top: "18%", right: "18%", rotate: -25, color: "var(--yellow)", size: 16, shape: "rect" },
    { top: "30%", left: "8%", rotate: 45, color: "var(--mint-ink)", size: 12, shape: "rect" },
    { top: "25%", right: "10%", rotate: 12, color: "var(--pink)", size: 18, shape: "circle" },
    { top: "72%", left: "14%", rotate: -15, color: "var(--yellow)", size: 20, shape: "rect" },
    { top: "78%", right: "12%", rotate: 30, color: "var(--pink)", size: 14, shape: "circle" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/75 backdrop-blur-xs">
        {/* Backdrop click to dismiss */}
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={onKeepSwiping}
          aria-label="Close match overlay"
        />

        {/* Confetti particles */}
        {confettiShapes.map((c, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
            className="absolute pointer-events-none"
            style={{
              top: c.top,
              left: c.left,
              right: c.right,
              width: c.size,
              height: c.size,
              backgroundColor: c.color,
              borderRadius: c.shape === "circle" ? "9999px" : "4px",
              transform: `rotate(${c.rotate}deg)`,
            }}
          />
        ))}

        {/* The Match Card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -4 }}
          animate={{ scale: 1, opacity: 1, rotate: 1 }}
          exit={{ scale: 0.8, opacity: 0, rotate: -4 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative z-10 w-full max-w-[360px] bg-white rounded-[32px] border-2 border-ink shadow-hard p-6 flex flex-col items-center text-center"
        >
          {/* Overlapping Avatars with Central Heart */}
          <div className="relative flex items-center justify-center mb-6 mt-2 h-24 w-44">
            {/* User Avatar (Y) */}
            <div className="absolute left-3 w-20 h-20 rounded-full border-2 border-ink bg-[#FFE14D] flex items-center justify-center shadow-hard-sm z-10">
              <span
                className="text-2xl font-[800] text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Y
              </span>
            </div>

            {/* Match Avatar */}
            <div className="absolute right-3 w-20 h-20 rounded-full border-2 border-ink bg-surface overflow-hidden shadow-hard-sm z-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoSrc}
                alt={profile.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            </div>

            {/* Overlapping Heart Circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 400 }}
              className="absolute z-20 w-11 h-11 rounded-full bg-pink border-2 border-ink flex items-center justify-center shadow-hard-sm"
            >
              <Heart size={20} className="fill-ink text-ink" />
            </motion.div>
          </div>

          {/* Heading */}
          <h2
            className="text-3xl font-[800] text-ink tracking-tight mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            It&apos;s a match!
          </h2>

          <p className="text-sm font-medium text-muted mb-7">
            You and <span className="font-bold text-ink">{profile.name}</span> liked each other
          </p>

          {/* Primary Action Button */}
          <button
            onClick={onKeepSwiping}
            className="w-full py-3.5 px-6 rounded-full bg-pink border-2 border-ink text-ink font-[800] text-base tracking-tight shadow-hard transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-hard-sm mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Keep swiping
          </button>

          {/* Secondary Action */}
          <button
            onClick={onViewMatches}
            className="text-sm font-semibold text-muted underline hover:text-ink transition-colors py-1"
          >
            View matches
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
