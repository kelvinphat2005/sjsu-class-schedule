import seed from "@/data/classes.seed.json";

import type { ClassRow } from "@/types/domain";

let cache: { rows: ClassRow[]; byId: Map<number, ClassRow> } | null = null;

export function getClassesSync() {
  if (!cache) {
    const rows = seed as unknown as ClassRow[];
    const byId = new Map<number, ClassRow>(rows.map(r => [Number(r.classNumber), r]));
    cache = { rows, byId };
  }
  return cache;
}
