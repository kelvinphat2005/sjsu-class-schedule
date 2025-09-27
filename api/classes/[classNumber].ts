import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureLoaded, getRow } from "../_bootstrap";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureLoaded();
  const num = Number(req.query.classNumber);
  if (!Number.isFinite(num)) return res.status(400).json({ error: "classNumber must be a number" });
  const row = getRow(num);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.status(200).json({ row });
}