import { NextResponse } from "next/server";

export const runtime = "nodejs"; // only if you use Node APIs/KV/etc.

export async function GET() {
  return NextResponse.json({ ok: true });
}