"use client";

import { useState } from "react";
import { PublicProfile } from "@/lib/repository";
import { ProfileSheet } from "./ProfileSheet";
import { ACCENT_COLORS } from "@/lib/avatar";

interface MatchItem {
  profile: PublicProfile;
  matchedAt: string;
}

interface MatchesViewProps {
  matches: MatchItem[];
  loading?: boolean;
}

export function MatchesView({ matches, loading = false }: MatchesViewProps) {
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="w-full h-20 rounded-[20px] border-2 border-ink bg-surface skeleton"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
      {matches.length === 0 ? (
        // Coy's dashed ghost row empty state (styled like "Free slot")
        <div className="my-auto flex flex-col items-center justify-center p-8 text-center">
          <div className="w-full py-6 px-4 rounded-[20px] border-2 border-dashed border-muted/60 bg-surface/50 flex flex-col items-center justify-center gap-2">
            <span className="text-2xl">👀</span>
            <p
              className="text-base font-bold text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              No matches yet
            </p>
            <p className="text-xs text-muted font-medium max-w-[240px]">
              Keep swiping on profiles in Discover. When someone likes you back, they&apos;ll show up here!
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((item) => {
            const { profile } = item;
            const accent = ACCENT_COLORS[profile.accent] || ACCENT_COLORS.peach;
            const initial = profile.name ? profile.name.charAt(0).toUpperCase() : "?";

            return (
              <button
                key={profile.id}
                onClick={() => setSelectedMatch(item)}
                className="w-full text-left p-3.5 rounded-[20px] border-2 border-ink bg-surface flex items-center justify-between gap-3 shadow-hard-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
                aria-label={`View match details for ${profile.name}`}
              >
                {/* Avatar */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-13 h-13 rounded-full border-2 border-ink flex items-center justify-center overflow-hidden shrink-0 shadow-xs"
                    style={{ backgroundColor: accent.bg }}
                  >
                    <span
                      className="text-lg font-[800] text-ink"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {initial}
                    </span>
                  </div>

                  {/* Name and subtitle */}
                  <div className="min-w-0">
                    <p
                      className="font-[800] text-base text-ink tracking-tight truncate"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {profile.name}, {profile.age}
                    </p>
                    <p className="text-xs text-muted truncate">
                      {profile.city || profile.college || "India"}
                    </p>
                  </div>
                </div>

                {/* Mint "Matched" badge */}
                <div className="shrink-0 px-3 py-1 rounded-full bg-[#CDF3DC] border border-[#178A47]/40 text-[#178A47] text-xs font-[700]">
                  Matched
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Details Sheet */}
      <ProfileSheet
        profile={selectedMatch ? selectedMatch.profile : null}
        matchedAt={selectedMatch?.matchedAt}
        onClose={() => setSelectedMatch(null)}
      />
    </div>
  );
}
