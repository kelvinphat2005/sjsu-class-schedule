import { NextResponse } from "next/server";
import { RateMyProfessor } from "rate-my-professor-api-ts";

import type { Professor, ProfessorReview } from "@/types/domain";

import { readProfessorInfo, readProfessorReview, writeProfessorInfo, writeProfessorReview } from "@/lib/professorStore";

export const runtime = "nodejs"; // safe default

const textbookUse = (value: number): string => {
    switch (value) {
        case 3:
            return "Yes";
        case 1:
            return "No";
        case -1:
            return "N/A";
        default:
            return "Unknown";
    }
};

const parseComments = (comments: String): string[] => {
    return comments.split("--").map((tag) => tag.trim()).filter((tag) => tag.length > 0);
};

export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
    const { name: idParam } = await ctx.params;

    // check storage
    const cachedProf = await readProfessorInfo(idParam);
    const cachedRev = await readProfessorReview(idParam);
    if (cachedProf && cachedRev) {
        return NextResponse.json({ professor: cachedProf, reviews: cachedRev });
    }

    // scrape if miss
    const rmp_instance = new RateMyProfessor(process.env.RMP_DEFAULT_SCHOOL || "San Jose State University");
    if (!rmp_instance) {
        return NextResponse.json({ error: "RMP instance could not be created" }, { status: 500 });
    }
    
    rmp_instance.set_professor_name(idParam);

    const pi = await rmp_instance.get_professor_info();
    const professor_info : Professor = {
        name: [pi.firstName, pi.lastName].join(" "),
        averageQuality: pi.avgRating,
        difficulty: pi.avgDifficulty,
        wouldTakeAgainPercent: pi.wouldTakeAgainPercent,
        department: pi.department,
    };

    const pr = await rmp_instance.get_comments_by_professor();
    const professor_reviews: ProfessorReview[] =
    pr?.map((review) => ({
        profName: String(professor_info.name ?? ""),
        date: new Date(String(review.date_posted).replace(" ", "T").replace(" +0000 UTC", "Z")),
        quality: Number(review.clarity_rating),
        difficulty: Number(review.difficulty_rating),
        class: String(review.class),                    // String -> string
        attendance: String(review.attendance_status),   // String -> string
        wouldTakeAgain: Boolean(review.would_take_again),
        gradeReceived: String(review.student_grade),    // String -> string
        textbook: textbookUse(review.textbook_use) as "Yes" | "No" | "N/A",
        onlineClass: Boolean(review.is_online),
        grade: String(review.student_grade ?? "N/A"),
        reviewText: String(review.comment ?? ""),
        likes: Number(review.comment_likes ?? 0),
        dislikes: Number(review.comment_dislikes ?? 0),
        tags: parseComments(review.rating_tags) ?? [],
    })) ?? [];

    // write to storage
    await writeProfessorInfo(professor_info);
    await writeProfessorReview(professor_reviews);

    return NextResponse.json({ professor: professor_info, reviews: professor_reviews});
}