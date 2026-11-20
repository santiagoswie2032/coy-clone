"use client";

import { useState, useEffect } from "react";
import { Flame, Sparkles } from "lucide-react";
import { PublicProfile } from "@/lib/repository";
import { SwipeView } from "./SwipeView";
import { MatchesView } from "./MatchesView";
import { MatchModal } from "./MatchModal";

interface MatchItem {
  profile: PublicProfile;
  matchedAt: string;
}

export function DiscoverContent() {
  const [activeTab, setActiveTab] = useState<"swipe" | "matches">("swipe");
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [currentMatch, setCurrentMatch] = useState<MatchItem | null>(null);

  // Fetch matches from server
  useEffect(() => {
    let ignore = false;
    async function loadMatches() {
      try {
        const res = await fetch("/api/matches");
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setMatches(data.matches || []);
          }
        }
      } catch (err) {
        console.error("Failed to load matches", err);
      } finally {
        if (!ignore) {
          setLoadingMatches(false);
        }
      }
    }
    loadMatches();
    return () => {
      ignore = true;
    };
  }, []);

  // Handle a new mutual match from SwipeView
  const handleNewMatch = (match: MatchItem) => {
    setCurrentMatch(match);
    setMatches((prev) => [match, ...prev.filter((m) => m.profile.id !== match.profile.id)]);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Segmented Toggle: Swipe | Matches (n) */}
      <div className="flex justify-center px-4 pt-2 pb-3">
        <div className="inline-flex rounded-full border-2 border-ink bg-surface p-1 shadow-hard-sm">
          <button
            onClick={() => setActiveTab("swipe")}
            className={`flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-[800] transition-all ${
              activeTab === "swipe"
                ? "bg-pink text-ink shadow-hard-sm"
                : "text-muted hover:text-ink"
            }`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            <Flame size={14} className={activeTab === "swipe" ? "fill-ink text-ink" : ""} />
            <span>Swipe</span>
          </button>

          <button
            onClick={() => setActiveTab("matches")}
            className={`flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-[800] transition-all ${
              activeTab === "matches"
                ? "bg-pink text-ink shadow-hard-sm"
                : "text-muted hover:text-ink"
            }`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            <Sparkles size={14} className={activeTab === "matches" ? "fill-ink text-ink" : ""} />
            <span>Matches ({matches.length})</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === "swipe" ? (
          <SwipeView
            onMatch={handleNewMatch}
            onViewMatches={() => setActiveTab("matches")}
          />
        ) : (
          <MatchesView matches={matches} loading={loadingMatches} />
        )}
      </div>

      {/* Match Overlay */}
      <MatchModal
        match={currentMatch}
        onKeepSwiping={() => setCurrentMatch(null)}
        onViewMatches={() => {
          setCurrentMatch(null);
          setActiveTab("matches");
        }}
      />
    </div>
  );
}
