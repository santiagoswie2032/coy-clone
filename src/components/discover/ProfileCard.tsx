"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { MapPin, GraduationCap } from "lucide-react";
import { PublicProfile } from "@/lib/repository";
import { getFallbackAvatarSvg, ACCENT_COLORS } from "@/lib/avatar";

interface ProfileCardProps {
  profile: PublicProfile;
  isFront: boolean;
  onSwipe: (direction: "like" | "pass") => void;
  disabled?: boolean;
}

export function ProfileCard({
  profile,
  isFront,
  onSwipe,
  disabled = false,
}: ProfileCardProps) {
  const [imgError, setImgError] = useState(false);
  const accent = ACCENT_COLORS[profile.accent] || ACCENT_COLORS.peach;

  // Motion values for front card drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-14, 0, 14]);

  // Stamps opacity
  const likeOpacity = useTransform(x, [20, 90], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -90], [0, 1]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (disabled || !isFront) return;

    const offsetThreshold = 110;
    const velocityThreshold = 500;

    if (info.offset.x > offsetThreshold || info.velocity.x > velocityThreshold) {
      onSwipe("like");
    } else if (info.offset.x < -offsetThreshold || info.velocity.x < -velocityThreshold) {
      onSwipe("pass");
    }
  };

  const photoSrc = imgError
    ? getFallbackAvatarSvg(profile.name, accent.bg)
    : profile.photoUrl;

  if (!isFront) {
    // Peeking card behind active card
    return (
      <div
        className="absolute inset-0 w-full h-full rounded-[28px] border-2 border-ink shadow-hard overflow-hidden flex flex-col pointer-events-none transition-transform duration-200"
        style={{
          backgroundColor: accent.bg,
          transform: "scale(0.95) translateY(12px)",
          zIndex: 0,
        }}
        aria-hidden="true"
      >
        <div className="relative w-full h-[58%] overflow-hidden bg-surface border-b-2 border-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoSrc}
            alt={profile.name}
            className="w-full h-full object-cover select-none pointer-events-none"
            onError={() => setImgError(true)}
            draggable={false}
          />
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="h-6 w-32 bg-ink/10 rounded-full mb-2" />
            <div className="h-4 w-48 bg-ink/10 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 w-full h-full rounded-[28px] border-2 border-ink shadow-hard overflow-hidden flex flex-col bg-white cursor-grab active:cursor-grabbing select-none"
      style={{
        backgroundColor: accent.bg,
        x,
        rotate,
        zIndex: 10,
        touchAction: "pan-y",
      }}
      drag={disabled ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.65}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: "grabbing" }}
      aria-label={`Profile card for ${profile.name}, ${profile.age}`}
    >
      {/* LIKE stamp */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-6 left-6 z-30 pointer-events-none border-[3px] border-[#178A47] text-[#178A47] bg-[#CDF3DC]/90 px-4 py-1.5 rounded-xl font-[800] text-2xl tracking-wider -rotate-12 shadow-hard-sm"
      >
        LIKE
      </motion.div>

      {/* NOPE stamp */}
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute top-6 right-6 z-30 pointer-events-none border-[3px] border-[#D92D20] text-[#D92D20] bg-[#FEE4E2]/90 px-4 py-1.5 rounded-xl font-[800] text-2xl tracking-wider rotate-12 shadow-hard-sm"
      >
        NOPE
      </motion.div>

      {/* Photo area */}
      <div className="relative w-full h-[58%] overflow-hidden bg-surface border-b-2 border-ink shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoSrc}
          alt={profile.name}
          className="w-full h-full object-cover select-none pointer-events-none"
          onError={() => setImgError(true)}
          draggable={false}
        />

        {/* Rotated Name Tag Pill overlapping bottom edge of photo */}
        <div className="absolute -bottom-3 left-4 z-20">
          <div
            className="px-4 py-1.5 rounded-full border-2 border-ink bg-white shadow-hard-sm -rotate-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-lg font-[800] text-ink tracking-tight">
              {profile.name}, {profile.age}
            </span>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 p-4 pt-5 flex flex-col justify-between overflow-hidden">
        <div>
          {/* City / College line */}
          <div className="flex items-center gap-1.5 text-xs text-muted font-medium mb-2">
            {profile.city && (
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-ink" />
                <span>{profile.city}</span>
              </span>
            )}
            {profile.city && profile.college && <span>•</span>}
            {profile.college && (
              <span className="flex items-center gap-1">
                <GraduationCap size={13} className="text-ink" />
                <span>{profile.college}</span>
              </span>
            )}
          </div>

          {/* Bio */}
          <p className="text-sm font-medium text-ink/90 leading-snug line-clamp-2 mb-3">
            {profile.bio}
          </p>
        </div>

        {/* Interests */}
        <div className="flex flex-wrap gap-1.5">
          {profile.interests.map((interest) => (
            <span
              key={interest}
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white border border-ink text-ink shadow-[1px_1px_0_var(--ink)]"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
