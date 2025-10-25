import { kv } from "@vercel/kv";

import type { ClassDetails } from "@/types/domain";

const PREFIX = "details:";
const DEFAULT_TTL = 60 * 60 * 24 * 30; // 30 days

const key = (courseKey: string) => `${PREFIX}${courseKey}`;

export async function readClassDetails(courseKey: string): Promise<ClassDetails | null> {
  return (await kv.get<ClassDetails>(key(courseKey))) ?? null;
}

export async function writeClassDetails(
  details: ClassDetails,
  ttlSeconds: number = DEFAULT_TTL
): Promise<void> {
  const value: ClassDetails = { ...details};
  await kv.set(key(details.courseKey), value, { ex: ttlSeconds });
}

// Optional helpers — use if you want them:

export async function deleteClassDetails(courseKey: string): Promise<void> {
  await kv.del(key(courseKey));
}

