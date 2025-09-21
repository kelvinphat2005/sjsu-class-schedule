import express from "express";
import fs from "fs";
import { constants } from "node:fs";
import type { ClassRow } from "./ClassSchedulesScraper";

import { writeClassDetails, readClassDetails } from "../data/detailsDb";
import { getClass } from "./ClassServerClient";

import { findCourseLink, getCourseDetails } from "./CourseCatalogScraper";

import { readProfessorComments, writeProfessorComments, readProfessorRatings, writeProfessorRatings } from "../data/professorsDb";
import { getComments, getRatings } from "./RateMyProfessorScraper";
import { getClasses } from "./ClassSchedulesScraper"; // <- use to seed once
import path from "node:path";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";


const PATH = path.resolve(process.cwd(), ".cache", "classes.json")
const PATH2 = path.resolve(process.cwd(), ".cache", "classDetails.json");;
const PORT = 5174;

const app = express();

// map each class by classNumber on startup
let rows: ClassRow[] = [];
let byClassNumber = new Map<number, ClassRow>();


async function init() {
  // 1) ensure folder exists
  await mkdir(path.dirname(PATH), { recursive: true });
  await mkdir(path.dirname(PATH2), { recursive: true });

  // 2) create/seed file if missing
  try {
    await access(PATH, constants.F_OK);
    await access(PATH2, constants.F_OK);
  } catch {
    // Seed from scraper (or set to [] if you prefer)
    const seeded = await getClasses();
    await writeFile(PATH, JSON.stringify(seeded, null, 2), "utf8");
  }

  // 3) load into memory + build index
  const text = await readFile(PATH, "utf8");
  rows = JSON.parse(text) as ClassRow[];
  byClassNumber = new Map(rows.map(r => [r.classNumber, r]));
}

// read `classes.json` and return all classes
app.get("/api/classes", async (req, res) => {
    try {
        const text = await readFile(PATH, "utf8");
        const rows : ClassRow[] = JSON.parse(text) as ClassRow[];
        res.json({ count: rows.length, rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to read classes.json" });
    }
});

// get basic class details
app.get("/api/classes/:classNumber", (req, res) => {
    const num = Number(req.params.classNumber);
    if (!Number.isFinite(num)) return res.status(400).json({ error: "classNumber must be a number" });
    const row = byClassNumber.get(num);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({row});
});

// get advanced class details
app.get("/api/classes/:classNumber/details", async (req, res) => {
    // check if it is saved locally and read
    // FUTURE: if the oid is not matching the global oid --> update
    // if not saved locally, fetch
    // return details
    const cl = byClassNumber.get(Number(req.params.classNumber));
    if (!cl) {
      return res.status(404).json({ error: "class not found" });
    }

    const classKey = `${cl.subject.trim()} ${cl.course.trim()}`.toUpperCase();
    try {
        const row = await readClassDetails(classKey);
        if (!row) {
            // make new
            const url = await findCourseLink(cl.subject, cl.course);
            const details = await getCourseDetails(url);
            await writeClassDetails(details);
            return res.json({course: details});
        }
        return res.json({course: row});
    } catch (e: any) {
        console.log("SOMETHING WENT WRONG, ", e)
        return res.status(500).json({ error: e.message ?? "failed" });
    }
});

// get professor ratings and comments
app.get("/api/professors/:professorName", async (req, res) => {
    // if professor was never requested before, cache
    // else get the cached result
    console.log("name: ", req.params.professorName);
    try {
        const profRating = await readProfessorRatings(req.params.professorName);
        const profComments = await readProfessorComments(req.params.professorName);
        if (!profRating || !profComments) {
            // fetch and cache
            const ratings = await getRatings(req.params.professorName);
            const comments = await getComments(req.params.professorName);
            if (ratings) {
                await writeProfessorRatings(req.params.professorName, ratings);
            }
            if (comments) {
                await writeProfessorComments(req.params.professorName, comments);
            }
            return res.json({ ratings, comments });
        }
        return res.json({comments: profComments, ratings: profRating});
    } catch (e: any) {
        console.log("professor api gone wrong: ", e);
        return res.status(500).json({ error: e.message ?? "failed" });
    }
});

init()
  .then(() => app.listen(PORT, () => console.log("API Running on", PORT)))
  .catch((e) => {
    console.error("Failed to init:", e);
    process.exit(1);
  });