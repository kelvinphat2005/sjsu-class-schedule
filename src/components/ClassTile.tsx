import type { ClassRow } from "../scraper/ClassSchedulesScraper";
import { Link } from "react-router";

import { useState, useEffect } from "react";

import { getProfessor } from "../scraper/ClassServerClient";
import type { professorRating } from "../scraper/RateMyProfessorScraper";

interface ClassTileProps {
    classRow : ClassRow;
    onClick ?: () => void;
}

export function ClassTile({classRow, onClick} : ClassTileProps) {
    const [profRating, setProfRating] = useState<professorRating | undefined>(undefined);

    useEffect( () => {
        const getProfRating = async () => {
            try {
                const res = await getProfessor(classRow.instructor);
                setProfRating(res.ratings);
            } catch (e) {
                console.error("Error fetching professor rating: ", e);
                setProfRating(undefined);
            }
        }

        getProfRating();
    }, [classRow.instructor]);

    return(
        <Link  to={`/class/${classRow.classNumber}`} state={{classRow}}>
            <button className="flex flex-col my-2 rounded-lg bg-neutral-600 w-[100%] h-[180px] 
                        hover:brightness-80 cursor-pointer transition duration-100 ease-in-out
                        text-neutral-100"
                onClick={onClick}
                key={classRow.classNumber}
            >
                {/** header */}
                <div className="flex bg-neutral-500 px-2 rounded-t-lg h-[60px] text-lg items-center ">
                    <span><strong>{classRow.subject} {classRow.course} ({classRow.section})</strong> - {classRow.courseTitle}</span>
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
                            {/** TODO - ADD RATE MY PROFESSOR SCORE */}
                            {profRating ? `⭐ ${profRating.avgRating?.toFixed(2)} (${profRating.numRatings} ratings)` : "No RMP Data"}
                        </div>
                    </div>
                    <div className="flex flex-row justify-between">
                        <div>
                            Open Seats: {classRow.openSeats}
                        </div>
                        <div>
                            {/** TODO - ADD IDK */}
                            {}
                        </div>
                    </div>
                </div>
            </button>
        </Link>
        
    );
}