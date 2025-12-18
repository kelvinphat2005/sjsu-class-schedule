import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { getClasses } from "@/lib/scrapers/ClassSchedulesScraper";

export async function GET() {
  const MIN_INTERVAL = 60_000;

  const now = Date.now();
  const lastRun = await kv.get<number>("classes:lastRun");

  if (lastRun && now - lastRun < MIN_INTERVAL) {
    return NextResponse.json({
      ok: false,
      error: "Rate limited: wait before calling again",
      nextAllowedInMs: MIN_INTERVAL - (now - lastRun),
    }, { status: 429 });
  }

  try {
    const classes = await getClasses();

    await kv.set("classes", classes);
    await kv.set("classes:lastRun", now);

    return NextResponse.json({ ok: true, count: classes.length, timestamp: now });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err }, { status: 500 });
  }
}
