import type { Professor, ProfessorReview } from "@/types/domain";
import { useState, useEffect } from "react";

interface RmpPanelProps {
    professorName: string;
}

export default function RmpPanel({ professorName }: RmpPanelProps) {
    const [professor, setProfessor] = useState<Professor | null>(null);
    const [reviews, setReviews] = useState<ProfessorReview[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const resProf = await fetch(`/api/professor/${encodeURIComponent(professorName)}`);
            if (resProf.ok) {
                const profData = await resProf.json();
                setProfessor(profData.professor);
                setReviews(profData.reviews);
            } else {
                console.error("Error fetching professor info");
                return;
            }
        };
        fetchData();
    }, [professorName]);

    if (!professor) {
        return <div>Loading professor information...</div>;
    }

    return (
        <div className="w-full">
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 w-full items-start">
                {/* LEFT: professor info */}
                <div className="flex items-start gap-3">
                    <div>
                        <h4 className="text-base font-semibold leading-tight">{professor.name}</h4>
                        {/* Show department/school if available (doesn't require changing your types) */}
                        {(professor as any)?.department && (
                            <p className="text-xs text-neutral-400">{(professor as any).department}</p>
                        )}
                        {(professor as any)?.schoolName && (
                            <p className="text-xs text-neutral-400">{(professor as any).schoolName}</p>
                        )}
                    </div>
                </div>

                {/* overall stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 justify-items-center">
                    <RingStat
                        label="Quality"
                        value={typeof professor.averageQuality === "number" ? professor.averageQuality / 5 : null}
                        display={typeof professor.averageQuality === "number" ? professor.averageQuality.toFixed(2) : "N/A"}
                        goodIsHigh={true}
                    />
                    <RingStat
                        label="Difficulty"
                        value={typeof professor.difficulty === "number" ? professor.difficulty / 5 : null}
                        display={typeof professor.difficulty === "number" ? professor.difficulty.toFixed(2) : "N/A"}
                        goodIsHigh={false}
                    />
                    <RingStat
                        label="Would take again"
                        value={
                            typeof professor.wouldTakeAgainPercent === "number" ? professor.wouldTakeAgainPercent / 100 : null}
                        display={typeof professor.wouldTakeAgainPercent === "number" ? `${Math.round(professor.wouldTakeAgainPercent)}%` : "N/A"}
                        goodIsHigh={true}
                    />
                </div>
            </div>



            {/* reviews */}
            <div className="space-y-3 py-3">
                {reviews.map((r, i) => (
                    <div key={i} className="rounded-xl border p-3 w-full">
                        <div className="flex items-center text-xs py-1">
                            <span className="text-neutral-400">
                                {new Date(r.date).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="flex gap-2 items-center text-xs">
                            <span className="rounded-full border px-2 py-0.5">
                                Quality {r.quality}/5
                            </span>
                            <span className="rounded-full border px-2 py-0.5">
                                Difficulty {r.difficulty}/5
                            </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                            {r.class && <span className="rounded-full border px-2 py-0.5">{r.class}</span>}
                            {r.attendance && (
                                <span className="rounded-full border px-2 py-0.5">{r.attendance}</span>
                            )}
                            {r.textbook && (
                                <span className="rounded-full border px-2 py-0.5">Textbook: {r.textbook}</span>
                            )}
                            {r.grade && <span className="rounded-full border px-2 py-0.5">Grade: {r.grade}</span>}
                            <span className="rounded-full border px-2 py-0.5">
                                {r.wouldTakeAgain ? "Would take again" : "Would not take again"}
                            </span>
                        </div>

                        {r.tags?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {r.tags.map((t, idx) => (
                                    <span key={idx} className="rounded-full border px-2 py-0.5 text-[11px]">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        )}

                        {r.reviewText && <p className="mt-3 text-sm leading-6">{r.reviewText}</p>}
                    </div>
                ))}
            </div>
        </div>
    )
}

type RingStatProps = {
    label: string;
    value: number | null | undefined;
    display: string;
    goodIsHigh?: boolean;
};

function RingStat({ label, value, display, goodIsHigh = true }: RingStatProps) {
    const size = 88;
    const stroke = 10;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;

    const vNum =
        value === null || value === undefined || Number.isNaN(value as number)
            ? 0
            : Math.max(0, Math.min(1, Number(value)));

    const offset = c * (1 - vNum);
    const hue = 120 * (goodIsHigh ? vNum : 1 - vNum); // 0=red, 120=green
    const color = `hsl(${hue}, 70%, 45%)`;
    const showNA = value === null || value === undefined || Number.isNaN(value as number);

    return (
        <div className="flex flex-col items-center gap-1">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    stroke="currentColor"
                    className="text-neutral-700/30"
                    strokeWidth={stroke}
                    fill="none"
                />
                <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={r}
                        stroke={showNA ? "transparent" : color}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={c}
                        strokeDashoffset={offset}
                        fill="none"
                    />
                </g>
                <text
                    x="50%"
                    y="50%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="600"
                    fill="white"
                >
                    {display}
                </text>
            </svg>
            <div className="text-xs uppercase tracking-wide opacity-75 text-center">{label}</div>
        </div>
    );
}