import type { ClassRow } from "../src/scraper/ClassSchedulesScraper";
import { getClasses } from "../src/scraper/ClassSchedulesScraper";

let loaded = false;
let rows: ClassRow[] = [];
let byClassNumber = new Map<number, ClassRow>();

export async function ensureLoaded() {
  if (loaded) return;
  rows = await getClasses(); // your existing seeding source
  byClassNumber = new Map(rows.map(r => [r.classNumber, r]));
  loaded = true;
}

export function allRows() { return rows; }
export function getRow(num: number) { return byClassNumber.get(num); }