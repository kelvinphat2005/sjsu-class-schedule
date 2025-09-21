import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "node:path";

import type { professorComment, professorRating } from "../scraper/RateMyProfessorScraper";

type Data = {
    ratings: Record<string, professorRating>;
    comments: Record<string, professorComment[]>;
};

const FILE = path.resolve(process.cwd(), ".cache", "professors.json");
const adapter = new JSONFile<Data>(FILE);
const db = new Low<Data>(adapter, { comments: {}, ratings: {} });

export async function initDb() {
    await db.read();
    db.data ||= { comments: {}, ratings: {} };
}

export async function readProfessorComments(professorName: string) {
    await initDb();
    return db.data.comments[professorName.toLowerCase()] ?? null;
}

export async function writeProfessorComments(professorName: string, comments: professorComment[]) {
    await initDb();
    db.data.comments[professorName.toLowerCase()] = comments;
    await db.write();
}

export async function readProfessorRatings(professorName: string) {
    await initDb();
    return db.data.ratings[professorName.toLowerCase()] ?? null;
}

export async function writeProfessorRatings(professorName: string, ratings: professorRating) {
    await initDb();
    db.data.ratings[professorName.toLowerCase()] = ratings;
    await db.write();
}