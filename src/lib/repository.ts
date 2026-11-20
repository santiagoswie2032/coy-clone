import { getDb } from "./db";
import type Database from "better-sqlite3";

// Public profile shape — whitelist serialisation
export interface PublicProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  city: string | null;
  college: string | null;
  interests: string[];
  photoUrl: string;
  accent: string;
}

export interface MatchResult {
  profile: PublicProfile;
  matchedAt: string;
}

interface DbProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  city: string | null;
  college: string | null;
  interests: string;
  photo_url: string;
  accent: string;
  display_order: number;
}

/** Whitelist-based serialiser. NEVER includes incoming_likes data. */
export function toPublicProfile(row: DbProfile): PublicProfile {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    bio: row.bio,
    city: row.city,
    college: row.college,
    interests: JSON.parse(row.interests),
    photoUrl: row.photo_url,
    accent: row.accent,
  };
}

export class Repository {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db ?? getDb();
  }

  /**
   * Get unswiped profiles in display_order.
   */
  getFeed(limit: number = 10): { profiles: PublicProfile[]; remaining: number } {
    const rows = this.db.prepare(`
      SELECT p.* FROM profiles p
      WHERE p.id NOT IN (SELECT target_id FROM swipes)
      ORDER BY p.display_order ASC
      LIMIT ?
    `).all(limit) as DbProfile[];

    const totalRemaining = this.db.prepare(`
      SELECT COUNT(*) as n FROM profiles
      WHERE id NOT IN (SELECT target_id FROM swipes)
    `).get() as { n: number };

    return {
      profiles: rows.map(toPublicProfile),
      remaining: totalRemaining.n - rows.length,
    };
  }

  /**
   * Record a swipe. Returns match status.
   * All within a single transaction.
   */
  swipe(profileId: string, direction: "like" | "pass"): { matched: boolean; match?: MatchResult } {
    const result = this.db.transaction(() => {
      // Check profile exists
      const profile = this.db.prepare("SELECT * FROM profiles WHERE id = ?").get(profileId) as DbProfile | undefined;
      if (!profile) {
        return { error: "not_found" as const };
      }

      // Check if already swiped (idempotent)
      const existingSwipe = this.db.prepare("SELECT direction FROM swipes WHERE target_id = ?").get(profileId) as { direction: string } | undefined;
      if (existingSwipe) {
        // Return original outcome
        const existingMatch = this.db.prepare("SELECT matched_at FROM matches WHERE profile_id = ?").get(profileId) as { matched_at: string } | undefined;
        if (existingMatch) {
          return {
            matched: true,
            match: {
              profile: toPublicProfile(profile),
              matchedAt: existingMatch.matched_at,
            },
          };
        }
        return { matched: false };
      }

      // Insert swipe
      this.db.prepare("INSERT INTO swipes (target_id, direction) VALUES (?, ?)").run(profileId, direction);

      // Check for mutual match (only place incoming_likes is read)
      if (direction === "like" && this.isMutual(profileId)) {
        this.db.prepare("INSERT INTO matches (profile_id) VALUES (?)").run(profileId);
        const matchRow = this.db.prepare("SELECT matched_at FROM matches WHERE profile_id = ?").get(profileId) as { matched_at: string };
        return {
          matched: true,
          match: {
            profile: toPublicProfile(profile),
            matchedAt: matchRow.matched_at,
          },
        };
      }

      return { matched: false };
    })();

    if ("error" in result && result.error === "not_found") {
      throw new Error("PROFILE_NOT_FOUND");
    }

    return result as { matched: boolean; match?: MatchResult };
  }

  /**
   * ONLY function that may read incoming_likes.
   * Checks if a profile has an incoming like.
   */
  private isMutual(profileId: string): boolean {
    const row = this.db.prepare("SELECT 1 FROM incoming_likes WHERE profile_id = ?").get(profileId);
    return !!row;
  }

  /**
   * Get all matches, most recent first.
   */
  getMatches(): MatchResult[] {
    const rows = this.db.prepare(`
      SELECT p.*, m.matched_at FROM matches m
      JOIN profiles p ON p.id = m.profile_id
      ORDER BY m.matched_at DESC
    `).all() as (DbProfile & { matched_at: string })[];

    return rows.map((row) => ({
      profile: toPublicProfile(row),
      matchedAt: row.matched_at,
    }));
  }

  /**
   * Check if a profile exists.
   */
  profileExists(profileId: string): boolean {
    const row = this.db.prepare("SELECT 1 FROM profiles WHERE id = ?").get(profileId);
    return !!row;
  }
}
