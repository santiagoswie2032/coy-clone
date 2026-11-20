"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, GraduationCap } from "lucide-react";
import { PublicProfile } from "@/lib/repository";
import { getFallbackAvatarSvg, ACCENT_COLORS } from "@/lib/avatar";

interface ProfileSheetProps {
  profile: PublicProfile | null;
  matchedAt?: string;
  onClose: () => void;
}

export function ProfileSheet({ profile, matchedAt, onClose }: ProfileSheetProps) {
  const [imgError, setImgError] = useState(false);

  if (!profile) return null;

  const accent = ACCENT_COLORS[profile.accent] || ACCENT_COLORS.peach;
  const photoSrc = imgError
    ? getFallbackAvatarSvg(profile.name, accent.bg)
    : profile.photoUrl;

  const formattedDate = matchedAt
    ? new Date(matchedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/60 backdrop-blur-xs">
        {/* Backdrop */}
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={onClose}
          aria-label="Close sheet"
        />

        {/* Modal / Sheet Container */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="relative z-10 w-full max-w-[480px] bg-white rounded-t-[32px] border-t-2 border-x-2 border-ink shadow-hard p-6 max-h-[85vh] overflow-y-auto pb-10"
        >
          {/* Top Handle */}
          <div className="w-12 h-1.5 bg-ink/20 rounded-full mx-auto mb-5" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full border-2 border-ink bg-surface flex items-center justify-center hover:bg-track transition-colors shadow-hard-sm"
            aria-label="Close details"
          >
            <X size={18} className="text-ink" />
          </button>

          {/* Header section with photo and name */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-20 h-20 rounded-full border-2 border-ink overflow-hidden shrink-0 shadow-hard-sm"
              style={{ backgroundColor: accent.bg }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoSrc}
                alt={profile.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className="text-2xl font-[800] text-ink"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {profile.name}, {profile.age}
                </h3>
              </div>

              {/* Location / College */}
              <div className="flex items-center gap-2 text-xs text-muted font-medium mt-1">
                {profile.city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-ink" />
                    <span>{profile.city}</span>
                  </span>
                )}
                {profile.city && profile.college && <span>•</span>}
                {profile.college && (
                  <span className="flex items-center gap-1">
                    <GraduationCap size={12} className="text-ink" />
                    <span>{profile.college}</span>
                  </span>
                )}
              </div>

              {formattedDate && (
                <div className="mt-1.5 inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#CDF3DC] text-[#178A47] border border-[#178A47]/30">
                  Matched {formattedDate}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="mb-6 p-4 rounded-2xl bg-surface border-2 border-ink">
            <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
              About
            </p>
            <p className="text-sm font-medium text-ink leading-relaxed">
              {profile.bio}
            </p>
          </div>

          {/* Interests */}
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
              Interests
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-white border-2 border-ink text-ink shadow-hard-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
