"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Heart, RotateCcw } from "lucide-react";
import { PublicProfile } from "@/lib/repository";
import { ProfileCard } from "./ProfileCard";
import { Toast } from "../ui/Toast";

interface SwipeViewProps {
  onMatch: (match: { profile: PublicProfile; matchedAt: string }) => void;
  onViewMatches: () => void;
}

export function SwipeView({ onMatch, onViewMatches }: SwipeViewProps) {
  const [queue, setQueue] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  // Keep track of swiped IDs locally to prevent any duplicate card ever reappearing
  const swipedIdsRef = useRef<Set<string>>(new Set());
  const fetchingRef = useRef(false);
  const exitDirectionRef = useRef<"like" | "pass">("like");

  // Fetch feed cards
  const fetchMoreCards = useCallback(async (limit: number = 10) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const res = await fetch(`/api/feed?limit=${limit}`);
      if (!res.ok) throw new Error("Failed to load feed");
      const data = await res.json();
      const freshProfiles: PublicProfile[] = data.profiles.filter(
        (p: PublicProfile) => !swipedIdsRef.current.has(p.id)
      );

      setQueue((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const combined = [...prev, ...freshProfiles.filter((p) => !existingIds.has(p.id))];
        return combined;
      });
    } catch {
      setErrorMessage("Could not load profiles. Please try again.");
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchMoreCards(10);
  }, [fetchMoreCards]);

  // Prefetch when <= 3 cards remain
  useEffect(() => {
    if (!loading && queue.length <= 3 && queue.length > 0) {
      fetchMoreCards(10);
    }
  }, [queue.length, loading, fetchMoreCards]);

  // Handle swipe action
  const handleSwipe = useCallback(
    async (direction: "like" | "pass") => {
      if (animating || queue.length === 0) return;

      const currentCard = queue[0];
      if (!currentCard) return;

      // Mark swiped
      swipedIdsRef.current.add(currentCard.id);
      exitDirectionRef.current = direction;
      setAnimating(true);

      // Optimistically remove card after short animation delay
      setTimeout(() => {
        setQueue((prev) => prev.slice(1));
        setAnimating(false);
      }, 220);

      // Background API call
      try {
        const res = await fetch("/api/swipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId: currentCard.id, direction }),
        });

        if (!res.ok) throw new Error("Swipe request failed");
        const data = await res.json();

        if (data.matched && data.match) {
          // Delay match overlay slightly so card completes exit
          setTimeout(() => {
            onMatch(data.match);
          }, 240);
        }
      } catch {
        // Rollback on network error
        swipedIdsRef.current.delete(currentCard.id);
        setErrorMessage("Couldn't save that swipe. Restoring card...");
        setQueue((prev) => [currentCard, ...prev]);
      }
    },
    [animating, queue, onMatch]
  );

  // Keyboard navigation: Left = pass, Right = like
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleSwipe("pass");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleSwipe("like");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSwipe]);

  // Reset demo handler
  const handleResetDemo = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/dev/reset", { method: "POST" });
      if (!res.ok) throw new Error("Reset failed");
      swipedIdsRef.current.clear();
      setQueue([]);
      setLoading(true);
      await fetchMoreCards(10);
    } catch {
      setErrorMessage("Failed to reset demo.");
    } finally {
      setResetting(false);
    }
  };

  if (loading && queue.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Skeleton Card */}
        <div className="w-full max-w-[360px] h-[520px] rounded-[28px] border-2 border-ink bg-surface shadow-hard overflow-hidden flex flex-col skeleton">
          <div className="w-full h-[58%] border-b-2 border-ink/20" />
          <div className="p-4 space-y-3">
            <div className="h-6 w-36 bg-ink/10 rounded-full" />
            <div className="h-4 w-48 bg-ink/10 rounded-full" />
            <div className="h-10 w-full bg-ink/10 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Empty state: No more profiles in feed
  if (queue.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Toast message={errorMessage} onClose={() => setErrorMessage(null)} />

        <div className="w-full max-w-[360px] bg-lavender rounded-[32px] border-2 border-ink shadow-hard p-6 flex flex-col items-center">
          {/* Dot Grid Motif from Coy Home */}
          <div className="grid grid-cols-7 gap-2 mb-6 opacity-40">
            {Array.from({ length: 21 }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === 10 ? "bg-pink opacity-100" : "bg-ink"
                }`}
              />
            ))}
          </div>

          <h3
            className="text-2xl font-[800] text-ink tracking-tight mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            You&apos;ve seen everyone for now
          </h3>

          <p className="text-sm font-medium text-muted mb-6">
            Check your matches or come back later.
          </p>

          <button
            onClick={onViewMatches}
            className="w-full py-3.5 px-6 rounded-full bg-pink border-2 border-ink text-ink font-[800] text-base shadow-hard transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-hard-sm mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            View matches
          </button>

          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted underline hover:text-ink transition-colors"
          >
            <RotateCcw size={12} />
            <span>{resetting ? "Resetting..." : "Reset demo"}</span>
          </button>
        </div>
      </div>
    );
  }

  const frontCard = queue[0];
  const peekCard = queue[1];

  return (
    <div className="flex-1 flex flex-col items-center justify-between px-4 py-1 max-w-[420px] mx-auto w-full h-full min-h-0 overflow-hidden">
      <Toast message={errorMessage} onClose={() => setErrorMessage(null)} />

      {/* Card Container */}
      <div className="relative w-full h-[min(440px,55vh)] max-w-[350px] my-auto">
        {/* Peeking card behind */}
        {peekCard && (
          <ProfileCard
            key={peekCard.id}
            profile={peekCard}
            isFront={false}
            onSwipe={() => {}}
          />
        )}

        {/* Active front card */}
        {frontCard && (
          <ProfileCard
            key={frontCard.id}
            profile={frontCard}
            isFront={true}
            onSwipe={handleSwipe}
            disabled={animating}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-8 py-2 z-20 shrink-0">
        {/* Pass Button */}
        <button
          onClick={() => handleSwipe("pass")}
          disabled={animating}
          className="w-14 h-14 rounded-full border-2 border-ink bg-white flex items-center justify-center shadow-hard transition-all hover:bg-surface active:translate-x-[2px] active:translate-y-[2px] active:shadow-hard-sm disabled:opacity-50"
          aria-label="Pass profile (Left Arrow)"
        >
          <X size={26} className="text-ink stroke-[2.5]" />
        </button>

        {/* Like Button */}
        <button
          onClick={() => handleSwipe("like")}
          disabled={animating}
          className="w-14 h-14 rounded-full border-2 border-ink bg-pink flex items-center justify-center shadow-hard transition-all hover:brightness-105 active:translate-x-[2px] active:translate-y-[2px] active:shadow-hard-sm disabled:opacity-50"
          aria-label="Like profile (Right Arrow)"
        >
          <Heart size={26} className="fill-ink text-ink" />
        </button>
      </div>
    </div>
  );
}
