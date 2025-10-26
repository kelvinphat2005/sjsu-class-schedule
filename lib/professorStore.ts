import { kv } from "@vercel/kv";
import type { Professor, ProfessorReview } from "@/types/domain";

import { RateMyProfessor } from "rate-my-professor-api-ts";

const PROF_PREFIX = "professor:";
const REVIEW_PREFIX = "professorReview:";
const DEFAULT_TTL = 60 * 60 * 24 * 30; // 30 days

const profKey = (professorName: string) => `${PROF_PREFIX}${professorName}`;
const reviewKey = (professorName: string) => `${REVIEW_PREFIX}${professorName}`;

// professor info
export async function readProfessorInfo(name : string) : Promise<Professor | null> {
    return (await kv.get<Professor>(profKey(name))) ?? null;
}

export async function writeProfessorInfo(prof : Professor, ttlSeconds: number = DEFAULT_TTL) : Promise<void> {
    const value: Professor = { ...prof};
    await kv.set(profKey(prof.name), value, { ex: ttlSeconds });
}

// professor reviews
export async function readProfessorReview(name : string) : Promise<ProfessorReview[] | null> {
    const reviews = await kv.get<ProfessorReview[]>(reviewKey(name));
    return reviews ?? [];
}

export async function writeProfessorReview(reviews : ProfessorReview[], ttlSeconds: number = DEFAULT_TTL) : Promise<void> {
    const reviewJSON = JSON.stringify(reviews);
    await kv.set(reviewKey(reviews[0].profName), reviewJSON, { ex: ttlSeconds });
}