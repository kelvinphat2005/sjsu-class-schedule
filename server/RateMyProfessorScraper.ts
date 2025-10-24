import { RateMyProfessor } from "rate-my-professor-api-ts";

import { writeProfessorComments, writeProfessorRatings } from "../src/data/professorsDb.js";

const rmp_instance = new RateMyProfessor("San Jose State University");

export type professorRating = {
    type: 'Teacher' | string,
    avgDifficulty: number | null,
    avgRating: number | null,
    department: string | null,
    firstName: string,
    lastName: string,
    id: string,
    isSaved: boolean,
    legacyId: number,
    numRatings: number,
    school: { id: string, name: string },
    wouldTakeAgainPercent: number | null,
}

export type professorComment = {
    class: string,
    date_posted: Date,
    comment: string,
    difficulty_rating: number,
    teacher_id: string,
    clarity_rating: number,
    student_grade: string,
    is_for_credit: boolean,
    attendance_status: string,
    is_online: boolean,
    comment_likes: number,
    comment_dislikes: number,
    rating_tags: string[],
    textbook_use: number,
    would_take_again: boolean,
}

export async function getRatings(professorName: string) : Promise<professorRating | null> {
    rmp_instance.set_professor_name(professorName);
    return await rmp_instance.get_professor_info();
}

export async function getComments(professorName: string) : Promise<professorComment[] | undefined> {
    rmp_instance.set_professor_name(professorName);
    const comments = await rmp_instance.get_comments_by_professor();
    return comments?.map((c: any) => ({
        ...c,
        date_posted: new Date(
            c.date_posted.replace(" ", "T").replace(" +0000 UTC", "Z")
          ),
        rating_tags: c.rating_tags ? c.rating_tags.split("--") : [],
    }));
}