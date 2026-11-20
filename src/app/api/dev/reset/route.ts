import { NextResponse } from "next/server";
import { resetDb } from "@/lib/db";

export async function POST() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEV_RESET !== "1") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  resetDb();
  return NextResponse.json({ ok: true, message: "Database reset and re-seeded" });
}
