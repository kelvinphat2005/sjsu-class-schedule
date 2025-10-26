import type { Professor, ProfessorReview } from "@/types/domain";

const RMP_SJSU_ID : number = 881;

export async function getProfessor(name : string) : Promise<Professor | null> {
    return null
}

async function findProfessor(name : string) : Promise<string | null> {
    const URL = `https://www.ratemyprofessors.com/search/professors/${RMP_SJSU_ID}?q=${encodeURIComponent(name)}`;
    return null
}