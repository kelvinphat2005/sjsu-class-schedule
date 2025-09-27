import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureLoaded, getRow } from "../../_bootstrap";
import { readClassDetails, writeClassDetails } from "../../../src/data/detailsDb";
import { findCourseLink, getCourseDetails } from "../../../src/scraper/CourseCatalogScraper";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureLoaded();
  const num = Number(req.query.classNumber);
  const cl = Number.isFinite(num) ? getRow(num) : undefined;
  if (!cl) return res.status(404).json({ error: "class not found" });

  const classKey = `${cl.subject.trim()} ${cl.course.trim()}`.toUpperCase();

  try {
    const saved = await readClassDetails(classKey);
    if (saved) return res.status(200).json({ course: saved });

    const url = await findCourseLink(cl.subject, cl.course);
    const details = await getCourseDetails(url);
    await writeClassDetails(details); // OK as ephemeral cache; use a DB if you need durability
    res.status(200).json({ course: details });
  } catch (e: any) {
    console.error("details error:", e);
    res.status(500).json({ error: e?.message ?? "failed" });
  }
}
