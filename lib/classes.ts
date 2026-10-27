import type { ClassRow } from "@/types/domain";
import { kv } from "@vercel/kv";

export async function getClassesSync() {
  const seed = await kv.get<ClassRow[]>("classes");
  const rows: ClassRow[] = Array.isArray(seed) ? seed : [];
  const byId = new Map<number, ClassRow>(
    rows.map((r) => [Number(r.classNumber), r])
  );
  return { rows, byId };
}