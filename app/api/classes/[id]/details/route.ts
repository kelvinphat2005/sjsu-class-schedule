import { NextResponse } from "next/server";
import { getClassesSync } from "@/lib/classes";

import { readClassDetails, writeClassDetails } from "@/lib/detailsStore";

export const runtime = "nodejs";

const CURRENT_OID = "17";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await ctx.params;
  const id = Number.parseInt(idParam?.trim() ?? "", 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "id must be a number" }, { status: 400 });
  }

  const { byId } = await getClassesSync();
  const row = byId.get(id);
  if (!row) return NextResponse.json({ error: "class not found" }, { status: 404 });

  const courseKey = `${row.subject.trim()} ${row.course.trim()}`.toUpperCase();

  // check cache
  const cached = await readClassDetails(courseKey);
  if (cached) {
    return NextResponse.json({ course: cached });
  }

  // scrape on miss
  try {
    const { findCourseLink, getCourseDetails } = await import("@/lib/scrapers/CourseCatalogScraper");
    const url = await findCourseLink(row.subject, row.course, CURRENT_OID);
    const details = await getCourseDetails(url, CURRENT_OID);
    await writeClassDetails(details); // write-through cache
    return NextResponse.json({ course: details });
  } catch {
    return NextResponse.json({ error: "details unavailable" }, { status: 503 });
  }
}