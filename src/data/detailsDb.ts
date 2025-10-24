import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "node:path";
import { mkdir } from "node:fs/promises";

import type { ClassDetails } from "../../server/CourseCatalogScraper.js";

type Data = {
  // key by subject and course
  courseDetails: Record<string, ClassDetails>;
};

const DATA_DIR = process.env.VERCEL ? "/tmp/.cache" : path.resolve(process.cwd(), ".cache");
await mkdir(DATA_DIR, { recursive: true }).catch(() => {});
const FILE = path.join(DATA_DIR, "classDetails.json");
const adapter = new JSONFile<Data>(FILE);
const db = new Low<Data>(adapter, { courseDetails: {} });

export async function initDb() {
    await db.read();
    db.data ||= { courseDetails: {} };
}

export async function readClassDetails(courseKey: string) {
    await initDb();
    return db.data.courseDetails[courseKey] ?? null;
}

export async function writeClassDetails(details: ClassDetails) {
    await initDb();
    db.data.courseDetails[details.courseKey] = details;
    await db.write();
}
