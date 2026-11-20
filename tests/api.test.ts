import { describe, it, expect, beforeEach } from "vitest";
import { POST as swipeHandler } from "@/app/api/swipe/route";
import { GET as feedHandler } from "@/app/api/feed/route";
import { GET as matchesHandler } from "@/app/api/matches/route";
import { resetDb } from "@/lib/db";
import { NextRequest } from "next/server";

describe("API Route Handlers", () => {
  beforeEach(() => {
    resetDb();
  });

  it("GET /api/feed returns valid feed response with 10 profiles by default", async () => {
    const req = new NextRequest("http://localhost:3000/api/feed");
    const res = await feedHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.profiles.length).toBe(10);
    expect(data.remaining).toBe(26);
  });

  it("POST /api/swipe returns 400 for invalid body", async () => {
    const req = new NextRequest("http://localhost:3000/api/swipe", {
      method: "POST",
      body: JSON.stringify({ profileId: "p01", direction: "invalid-direction" }),
    });
    const res = await swipeHandler(req);
    expect(res.status).toBe(400);
  });

  it("POST /api/swipe returns 404 for unknown profile", async () => {
    const req = new NextRequest("http://localhost:3000/api/swipe", {
      method: "POST",
      body: JSON.stringify({ profileId: "non-existent-id", direction: "like" }),
    });
    const res = await swipeHandler(req);
    expect(res.status).toBe(404);
  });

  it("POST /api/swipe returns match on mutual like", async () => {
    // p02 is in incoming_likes
    const req = new NextRequest("http://localhost:3000/api/swipe", {
      method: "POST",
      body: JSON.stringify({ profileId: "p02", direction: "like" }),
    });
    const res = await swipeHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.matched).toBe(true);
    expect(data.match.profile.id).toBe("p02");

    // Check GET /api/matches reflects this match
    const matchesRes = await matchesHandler();
    expect(matchesRes.status).toBe(200);
    const matchesData = await matchesRes.json();
    expect(matchesData.matches.length).toBe(1);
    expect(matchesData.matches[0].profile.id).toBe("p02");
  });
});
