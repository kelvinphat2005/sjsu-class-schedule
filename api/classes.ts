import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureLoaded, allRows } from "./_bootstrap";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    await ensureLoaded();
    const rows = allRows();
    res.status(200).json({ count: rows.length, rows });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e?.message ?? "Failed to list classes" });
  }
}