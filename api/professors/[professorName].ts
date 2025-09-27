import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  readProfessorComments, writeProfessorComments,
  readProfessorRatings, writeProfessorRatings
} from "../../src/data/professorsDb";
import { getComments, getRatings } from "../../src/scraper/RateMyProfessorScraper";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const name = String(req.query.professorName ?? "").trim();
  if (!name) return res.status(400).json({ error: "missing professorName" });

  try {
    const ratingsSaved = await readProfessorRatings(name);
    const commentsSaved = await readProfessorComments(name);

    if (ratingsSaved && commentsSaved) {
      return res.status(200).json({ ratings: ratingsSaved, comments: commentsSaved });
    }

    const ratings = await getRatings(name);
    const comments = await getComments(name);

    if (ratings) await writeProfessorRatings(name, ratings);
    if (comments) await writeProfessorComments(name, comments);

    res.status(200).json({ ratings: ratings ?? null, comments: comments ?? null });
  } catch (e: any) {
    console.error("professor api error:", e);
    res.status(500).json({ error: e?.message ?? "failed" });
  }
}
