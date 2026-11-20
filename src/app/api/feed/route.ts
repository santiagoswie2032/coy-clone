import { NextRequest, NextResponse } from "next/server";
import { Repository } from "@/lib/repository";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  let limit = 10;

  if (limitParam) {
    limit = parseInt(limitParam, 10);
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 50) limit = 50;
  }

  const repo = new Repository();
  const result = repo.getFeed(limit);

  return NextResponse.json(result);
}
