import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import fs from "fs";
import { SCHEMA, seedDatabase, SEED_PROFILES, INCOMING_LIKE_IDS } from "@/lib/db";
import { Repository, PublicProfile } from "@/lib/repository";

const PUBLIC_PROFILE_KEYS: (keyof PublicProfile)[] = [
  "id",
  "name",
  "age",
  "bio",
  "city",
  "college",
  "interests",
  "photoUrl",
  "accent",
];

const FORBIDDEN_KEYS = [
  "incoming",
  "incoming_likes",
  "incomingLikes",
  "likedMe",
  "likesYou",
  "liked_me",
  "likes_you",
  "isMutual",
  "is_mutual",
  "priority",
];

function createTestDb(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  seedDatabase(db);
  return db;
}

describe("Coy Discover Backend & Privacy Invariant Tests", () => {
  let db: Database.Database;
  let repo: Repository;

  beforeEach(() => {
    db = createTestDb();
    repo = new Repository(db);
  });

  // 1. Seed creates >= 30 profiles and >= 1 incoming like; feed JSON never contains any key not in the public whitelist.
  it("Requirement 1: Seeds >= 30 profiles, >= 1 incoming like, and feed JSON strictly matches public whitelist", () => {
    expect(SEED_PROFILES.length).toBeGreaterThanOrEqual(30);
    expect(INCOMING_LIKE_IDS.length).toBeGreaterThanOrEqual(1);

    const feed = repo.getFeed(10);
    expect(feed.profiles.length).toBe(10);

    for (const profile of feed.profiles) {
      const keys = Object.keys(profile);
      expect(keys.sort()).toEqual([...PUBLIC_PROFILE_KEYS].sort());
      for (const forbidden of FORBIDDEN_KEYS) {
        expect(profile).not.toHaveProperty(forbidden);
      }
    }
  });

  // 2. Feed excludes swiped profiles; feed shrinks after each swipe; remaining correct.
  it("Requirement 2: Feed excludes swiped profiles, shrinks after each swipe, and reports remaining count correctly", () => {
    const initialFeed = repo.getFeed(50);
    const initialCount = initialFeed.profiles.length;
    expect(initialCount).toBe(36);
    expect(initialFeed.remaining).toBe(0); // 36 returned, 0 left

    const page1 = repo.getFeed(5);
    expect(page1.profiles.length).toBe(5);
    expect(page1.remaining).toBe(31);

    const firstId = page1.profiles[0].id;
    repo.swipe(firstId, "pass");

    const pageAfterPass = repo.getFeed(5);
    expect(pageAfterPass.profiles.length).toBe(5);
    expect(pageAfterPass.remaining).toBe(30);
    expect(pageAfterPass.profiles.find((p) => p.id === firstId)).toBeUndefined();
  });

  // 3. Swiping right on an incoming-liker -> matched: true, row in matches.
  it("Requirement 3: Swiping right on an incoming-liker produces matched: true and saves to matches table", () => {
    const likerId = INCOMING_LIKE_IDS[0]; // e.g. p02
    const result = repo.swipe(likerId, "like");

    expect(result.matched).toBe(true);
    expect(result.match).toBeDefined();
    expect(result.match?.profile.id).toBe(likerId);
    expect(result.match?.matchedAt).toBeDefined();

    const matches = repo.getMatches();
    expect(matches.length).toBe(1);
    expect(matches[0].profile.id).toBe(likerId);
  });

  // 4. Swiping right on a non-liker -> matched: false, no match.
  it("Requirement 4: Swiping right on a non-liker produces matched: false and does NOT insert into matches", () => {
    const nonLiker = SEED_PROFILES.find((p) => !INCOMING_LIKE_IDS.includes(p.id))!;
    const result = repo.swipe(nonLiker.id, "like");

    expect(result.matched).toBe(false);
    expect(result.match).toBeUndefined();

    const matches = repo.getMatches();
    expect(matches.length).toBe(0);
  });

  // 5. Swiping left on an incoming-liker -> matched: false, never matches later, and the profile never re-appears.
  it("Requirement 5: Swiping left on an incoming-liker returns matched: false, never matches later, and excludes profile from feed", () => {
    const likerId = INCOMING_LIKE_IDS[0];
    const result = repo.swipe(likerId, "pass");

    expect(result.matched).toBe(false);
    expect(result.match).toBeUndefined();

    // Check matches table is empty
    expect(repo.getMatches().length).toBe(0);

    // Profile must never reappear in feed
    const feed = repo.getFeed(50);
    expect(feed.profiles.find((p) => p.id === likerId)).toBeUndefined();

    // Attempting to swipe again later should be idempotent and not flip to match
    const retry = repo.swipe(likerId, "like");
    expect(retry.matched).toBe(false);
    expect(repo.getMatches().length).toBe(0);
  });

  // 6. Duplicate swipe -> idempotent (no duplicate rows, original outcome returned, direction unchanged).
  it("Requirement 6: Duplicate swipe is idempotent and cannot flip a pass into a like", () => {
    const likerId = INCOMING_LIKE_IDS[0];

    // First: pass
    const firstResult = repo.swipe(likerId, "pass");
    expect(firstResult.matched).toBe(false);

    // Second: try to like
    const secondResult = repo.swipe(likerId, "like");
    expect(secondResult.matched).toBe(false);

    // Verify DB still has 'pass'
    const swipeRow = db.prepare("SELECT direction FROM swipes WHERE target_id = ?").get(likerId) as { direction: string };
    expect(swipeRow.direction).toBe("pass");
    expect(repo.getMatches().length).toBe(0);

    // If first was like on incoming liker:
    const liker2 = INCOMING_LIKE_IDS[1];
    const match1 = repo.swipe(liker2, "like");
    expect(match1.matched).toBe(true);

    const match2 = repo.swipe(liker2, "like");
    expect(match2.matched).toBe(true);
    expect(match2.match?.profile.id).toBe(liker2);

    const matchRows = db.prepare("SELECT COUNT(*) as n FROM matches WHERE profile_id = ?").get(liker2) as { n: number };
    expect(matchRows.n).toBe(1);
  });

  // 7. Invalid body / unknown profile -> errors thrown / handled.
  it("Requirement 7: Unknown profile throws PROFILE_NOT_FOUND error", () => {
    expect(() => repo.swipe("unknown-id-999", "like")).toThrow("PROFILE_NOT_FOUND");
    expect(() => repo.swipe("unknown-id-999", "pass")).toThrow("PROFILE_NOT_FOUND");
  });

  // 8. GET /matches returns only mutual matches, newest first, public fields only.
  it("Requirement 8: Matches returns only mutual matches, newest first, with public fields only", () => {
    const liker1 = INCOMING_LIKE_IDS[0];
    const liker2 = INCOMING_LIKE_IDS[1];

    repo.swipe(liker1, "like");
    repo.swipe(liker2, "like");

    const matches = repo.getMatches();
    expect(matches.length).toBe(2);

    for (const match of matches) {
      const keys = Object.keys(match.profile);
      expect(keys.sort()).toEqual([...PUBLIC_PROFILE_KEYS].sort());
      for (const forbidden of FORBIDDEN_KEYS) {
        expect(match.profile).not.toHaveProperty(forbidden);
      }
      expect(match.matchedAt).toBeDefined();
    }
  });

  // 9. Privacy regression test: deep-scan the JSON of /feed, /swipe (non-match), and /matches for forbidden keys/strings.
  it("Requirement 9: Deep privacy regression scan reveals no forbidden keys or incoming likes leaks", () => {
    const feed = repo.getFeed(10);
    const feedJson = JSON.stringify(feed);

    for (const forbidden of FORBIDDEN_KEYS) {
      expect(feedJson.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }

    const nonLiker = SEED_PROFILES.find((p) => !INCOMING_LIKE_IDS.includes(p.id))!;
    const swipeResult = repo.swipe(nonLiker.id, "like");
    const swipeJson = JSON.stringify(swipeResult);

    for (const forbidden of FORBIDDEN_KEYS) {
      expect(swipeJson.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }

    const liker = INCOMING_LIKE_IDS[0];
    repo.swipe(liker, "like");
    const matchesResult = repo.getMatches();
    const matchesJson = JSON.stringify(matchesResult);

    for (const forbidden of FORBIDDEN_KEYS) {
      expect(matchesJson.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });

  // 10. Persistence: re-open the DB connection -> swipes and matches still present.
  it("Requirement 10: Swipes and matches persist across database reconnections", () => {
    // Test with a temporary file-backed SQLite database
    const tempDbPath = "./data/test-persistence.db";
    const db1 = new Database(tempDbPath);
    db1.exec(SCHEMA);
    seedDatabase(db1);

    const repo1 = new Repository(db1);
    const liker = INCOMING_LIKE_IDS[0];
    const nonLiker = SEED_PROFILES.find((p) => !INCOMING_LIKE_IDS.includes(p.id))!;

    repo1.swipe(liker, "like");
    repo1.swipe(nonLiker.id, "pass");
    db1.close();

    // Reopen
    const db2 = new Database(tempDbPath);
    const repo2 = new Repository(db2);

    const matches = repo2.getMatches();
    expect(matches.length).toBe(1);
    expect(matches[0].profile.id).toBe(liker);

    const feed = repo2.getFeed(50);
    expect(feed.profiles.find((p) => p.id === liker)).toBeUndefined();
    expect(feed.profiles.find((p) => p.id === nonLiker.id)).toBeUndefined();

    db2.close();
    // Clean up
    if (fs.existsSync(tempDbPath)) fs.unlinkSync(tempDbPath);
    if (fs.existsSync(tempDbPath + "-wal")) fs.unlinkSync(tempDbPath + "-wal");
    if (fs.existsSync(tempDbPath + "-shm")) fs.unlinkSync(tempDbPath + "-shm");
  });
});
