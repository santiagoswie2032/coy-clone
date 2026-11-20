import { NextResponse } from "next/server";
import { Repository } from "@/lib/repository";

export async function GET() {
  const repo = new Repository();
  const matches = repo.getMatches();
  return NextResponse.json({ matches });
}
