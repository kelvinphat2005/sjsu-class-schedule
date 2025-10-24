import type { ClassRow } from "../../server/ClassSchedulesScraper.js";
import { Link } from "react-router";

import { useState, useEffect, useRef } from "react";

import { getProfessor } from "../utils/ClassServerClient.js";
import type { professorRating } from "../../server/RateMyProfessorScraper.js";
import { rmpCache } from "../lib/rmpCache";


interface ClassTileProps {
    classRow: ClassRow;
    isFavorited?: boolean;
    onFavoritesClick?: () => void;
    addToCalendar?: () => void;
}

export function ClassTile({ classRow, isFavorited, onFavoritesClick, addToCalendar }: ClassTileProps) {
    const nameKey = classRow.instructor?.trim() || '';
    const [profRating, setProfRating] = useState<number  | null>(
        nameKey ? rmpCache.get(nameKey) : null
    );

    useEffect(() => {
        if (profRating) return;

        const controller = new AbortController();

        const getProfRating = async () => {
            try {
                const res = await getProfessor(classRow.instructor, controller.signal);
                const val = res?.ratings.avgRating ?? null;
                rmpCache.set(nameKey, val);
                setProfRating(res.ratings.avgDifficulty);
            } catch (e) {
                console.error("Error fetching professor rating: ", e, nameKey);
                rmpCache.set(nameKey, null);
                setProfRating(null);
            }
        }
        getProfRating();

        return () => {
            controller.abort("abort")
        }
    }, []);

    return (
        <Link to={addToCalendar !== undefined ? "/calendar" : `/class/${classRow.classNumber}`} state={{ classRow }}>
            <button className="flex flex-col my-2 rounded-lg bg-neutral-600 w-[98%] h-[180px] 
                        hover:brightness-80 cursor-pointer transition duration-100 ease-in-out
                        text-neutral-100"
                key={classRow.classNumber}
                onClick={addToCalendar !== undefined ? addToCalendar : undefined}
            >
                {/** header */}
                <div className="flex flex-row justify-between bg-neutral-500 px-2 rounded-t-lg h-[60px] text-lg items-center ">
                    <div>
                        <span><strong>{classRow.subject} {classRow.course} ({classRow.section})</strong> - {classRow.courseTitle}</span>
                    </div>
                    {/** favorite button */}
                    <div>
                        <svg onClick={onFavoritesClick} width="20" height="20" viewBox="0 0 24 24" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                            <path d="M12 21s-7-4.534-9.5-8.25C.5 8.5 3 5 6.5 5 8.24 5 9.91 5.81 11 7c1.09-1.19 2.76-2 4.5-2C19 5 21.5 8.5 21.5 12.75 19 16.466 12 21 12 21z" />
                        </svg>
                    </div>
                </div>
                {/** body */}
                <div className="flex flex-col p-2">
                    <div className="flex flex-row justify-between">
                        <div>
                            {classRow.location}
                        </div>
                        <div>
                            {classRow.days} {classRow.times}
                        </div>
                    </div>
                    <div className="flex flex-row justify-between">
                        <div>
                            {classRow.instructor}
                        </div>
                        <div>
                            {profRating ? `⭐ ${profRating?.toFixed(2)} (${profRating} ratings)` : "No RMP Data"}
                        </div>
                    </div>
                    <div className="flex flex-row justify-between">
                        <div>
                            Open Seats: {classRow.openSeats}
                        </div>
                        <div>
                            {/** TODO - ADD IDK */}
                            { }
                        </div>
                    </div>
                </div>
            </button>
        </Link>

    );
}