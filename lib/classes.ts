import type { ClassRow } from "@/types/domain";
import { kv } from "@vercel/kv";

let cache: { rows: ClassRow[]; byId: Map<number, ClassRow> } | null = null;

export async function getClassesSync() {
  if (!cache) {
    const seed = await kv.get<ClassRow[]>("classes");
    const rows: ClassRow[] = Array.isArray(seed) ? seed : [];
    const byId = new Map<number, ClassRow>(
      rows.map(r => [Number(r.classNumber), r])
    );

    cache = { rows, byId };
    }
  return cache;
}
