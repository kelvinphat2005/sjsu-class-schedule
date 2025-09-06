import type { professorComment } from "../scraper/RateMyProfessorScraper";

interface ProfessorCommentsDisplayProps {
    comments: professorComment[];
}

export default function ProfessorCommentsDisplay({ comments }: ProfessorCommentsDisplayProps) {
    console.log("buh")
    return (
        <div className="flex flex-col justify-between gap-2 rounded-lg bg-neutral-500 p-2">
            {comments.map((c, index) => (
                <CommentBlock key={index} comment={c} />
            ))}
        </div>
    );
}

interface CommentBlockProps {
    comment: professorComment;
}

function CommentBlock({ comment }: CommentBlockProps) {
    const formattedDate =
        comment.date_posted instanceof Date
            ? comment.date_posted.toLocaleDateString()
            : new Date(comment.date_posted).toLocaleDateString();

    const textbookUse = () => {
        if (comment.textbook_use === -1) return "N/A";
        if (comment.textbook_use === 3) return "Yes";
        else "No";
    }

    const qualityColor = (rating: number) => {
        if (rating >= 4) return "text-green-400 font-bold";
        if (rating >= 3) return "text-yellow-300";
        return "text-red-400 font-bold";
    }

    const difficultyColor = (rating: number) => {
        if (rating <= 2) return "text-green-400 font-bold";
        if (rating <= 3) return "text-yellow-300";
        return "text-red-400 font-bold";
    }


    return (
        <div className="flex flex-col bg-neutral-500 rounded-lg p-4 text-neutral-100 shadow gap-2">
            {/* Header */}
            <div className="flex flex-col">
                <span className="font-bold text-lg">{comment.class}</span>
                <span className="text-sm italic">{formattedDate}</span>
            </div>

            {/* Body */}
            <div className="text-base">{comment.comment}</div>

            {/* Ratings */}
            <div className="flex flex-col text-sm gap-1">
                <span className={difficultyColor(comment.difficulty_rating)}>
                    Difficulty: {comment.difficulty_rating}/5
                </span>
                <span className={qualityColor(comment.clarity_rating)}>
                    Quality: {comment.clarity_rating}/5
                </span>
                <span>Textbook use: {textbookUse()}</span>
                <span>
                    {comment.would_take_again ? "Would take again" : "Would not take again"}
                </span>
            </div>

            {/* Tags */}
            {comment.rating_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                    {comment.rating_tags.map((tag, i) => (
                        <span
                            key={i}
                            className="px-2 py-1 bg-neutral-600 rounded-xl text-xs"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex flex-col text-sm gap-1 mt-2">
                <span>
                    Attendance: {comment.attendance_status} ·{" "}
                    {comment.is_for_credit ? "For credit" : "Not for credit"} ·{" "}
                    {comment.is_online ? "Online" : "In person"}
                </span>
                <span>
                    👍 {comment.comment_likes} | 👎 {comment.comment_dislikes}
                </span>
            </div>
        </div>
    );
}