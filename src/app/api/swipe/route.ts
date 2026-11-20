import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Repository } from "@/lib/repository";

const SwipeSchema = z.object({
  profileId: z.string().min(1),
  direction: z.enum(["like", "pass"]),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SwipeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { profileId, direction } = parsed.data;
  const repo = new Repository();

  try {
    const result = repo.swipe(profileId, direction);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "PROFILE_NOT_FOUND") {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    throw err;
  }
}
