import type { professorComment, professorRating } from "../../server/RateMyProfessorScraper.js";

interface professorRatingProps {
    rating: professorRating;
    profId: number;
}

export default function ProfessorRatingDisplay({ rating, profId }: professorRatingProps) {
    const fullName = [rating.firstName, rating.lastName].filter(Boolean).join(" ");

    const fmtNum = (n?: number | null, digits = 1) =>
        typeof n === "number" && Number.isFinite(n) ? n.toFixed(digits) : "N/A";

    const fmtPct = (n?: number | null) =>
        typeof n === "number" && Number.isFinite(n) ? `${Math.round(n)}%` : "N/A";

    // background classes instead of just text
    const qualityBg = (r: number) => {
        if (r >= 4) return "bg-green-600";
        if (r >= 3) return "bg-yellow-500";
        return "bg-red-600";
    };

    const difficultyBg = (r: number) => {
        if (r <= 2) return "bg-green-600";
        if (r <= 3) return "bg-yellow-500";
        return "bg-red-600";
    };

    return (
        <div className="flex flex-col gap-3 rounded-lg bg-neutral-500 p-4 text-neutral-100 shadow">
            {/* Header */}
            <div className="flex flex-col">
                <div className="italic text-sm">Rate my Professor Reviews</div>
                <div className="text-2xl font-bold">{fullName || "Unnamed Professor"}</div>
                <div className="text-sm text-neutral-200">{rating.department || "—"}</div>
                <div className="italic text-sm">{rating.numRatings ?? 0} Ratings</div>

            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Metric
                    label="Overall Rating"
                    value={fmtNum(rating.avgRating)}
                    ariaLabel="Average overall rating out of 5"
                    bgClass={qualityBg(rating.avgRating ?? 0)}
                />
                <Metric
                    label="Difficulty"
                    value={fmtNum(rating.avgDifficulty)}
                    ariaLabel="Average difficulty out of 5"
                    bgClass={difficultyBg(rating.avgDifficulty ?? 0)}
                />
                <Metric
                    label="Would Take Again"
                    value={fmtPct(rating.wouldTakeAgainPercent)}
                    ariaLabel="Would take again percentage"
                    bgClass="bg-neutral-600" // stays neutral
                />
            </div>

            <div>
                <a href={`https://www.ratemyprofessors.com/professor/${profId}`}>
                    <button className="">View Full Site</button>
                </a>
            </div>
        </div>
    );
}

function Metric({
    label,
    value,
    ariaLabel,
    bgClass,
}: {
    label: string;
    value: string;
    ariaLabel?: string;
    bgClass: string;
}) {
    return (
        <div className={`flex flex-col items-start gap-2 rounded-lg ${bgClass} p-3`}>
            <div className="text-sm font-semibold">{label}</div>
            <div
                className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-300 bg-neutral-800/40 text-lg font-bold"
                aria-label={ariaLabel}
            >
                {value}
            </div>
        </div>
    );
}