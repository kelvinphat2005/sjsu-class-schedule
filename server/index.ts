import express from "express";
import fs from "fs";
import { constants } from "node:fs";
import type { ClassRow } from "./ClassSchedulesScraper.js";

import { getClasses } from "./ClassSchedulesScraper.js"; // <- use to seed once
import path from "node:path";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";

const DATA_DIR = process.env.VERCEL ? "/tmp/.cache" : path.resolve(process.cwd(), ".cache");
const PATH = path.join(DATA_DIR, "classes.json");
const PATH2 = path.join(DATA_DIR, "classDetails.json");
const PORT = 5174;

const app = express();

// map each class by classNumber on startup
let rows: ClassRow[] = [];
let byClassNumber = new Map<number, ClassRow>();


async function init() {
await mkdir(DATA_DIR, { recursive: true });

  // If cache file exists, load it; else copy from bundled seed; else scrape once.
  let needWrite = false;
  try {
    await access(PATH, constants.F_OK);
  } catch {
    // Try bundled seed (read-only asset inside the function)
    try {
      const seedUrl = new URL("../data/classes.seed.json", import.meta.url);
      const seedText = await readFile(seedUrl, "utf8");
      await writeFile(PATH, seedText, "utf8");
    } catch {
      // Last resort: scrape
      const seeded = await getClasses();
      await writeFile(PATH, JSON.stringify(seeded, null, 2), "utf8");
    }
    needWrite = true; // we created the file this boot
  }

  // Load into memory and build index
  const text = await readFile(PATH, "utf8");
  rows = JSON.parse(text) as ClassRow[];
  byClassNumber = new Map(rows.map(r => [r.classNumber, r]));

  // Ensure details file exists so detail route doesn’t 500
  try {
    await access(PATH2, constants.F_OK);
  } catch {
    await writeFile(PATH2, "{}", "utf8");
  }
}

const initPromise = init().catch(e => console.error("Failed to init:", e));

app.get(["/api", "/"], (_req, res) => res.json({ ok: true }));

// read `classes.json` and return all classes
app.get(["/api/classes", "/classes"], async (req, res) => {
    await initPromise;
    res.json({ count: rows.length, rows });
});

// get basic class details
app.get(["/api/classes/:classNumber", "/classes/:classNumber"], async (req, res) => {
    await initPromise;
    const num = Number(req.params.classNumber);
    if (!Number.isFinite(num)) return res.status(400).json({ error: "classNumber must be a number" });
    const row = byClassNumber.get(num);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({row});
});

export default app;