import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import { getClass, getClassesAPI } from "../scraper/ClassServerClient"
import type { ClassRow } from "../scraper/ClassSchedulesScraper"
import type { professorRating } from "../scraper/RateMyProfessorScraper";
import { getProfessor } from "../scraper/ClassServerClient";

/**
 * Given a class number, find related sections
 */
export async function findRelatedClasses(classNumber : number) : Promise<ClassRow[]> {
    // key: 'subject-course'
    const [thisClass, allClasses] = await Promise.all([
        getClass(classNumber),
        getClassesAPI(),
    ]);

    const courseKey : string = `${thisClass.subject.trim()}-${thisClass.course.trim()}`.toLowerCase();

    const relatedClasses : ClassRow[] = allClasses.filter((c) => {
        const currCourseKey = `${c.subject.trim()}-${c.course.trim()}`.toLowerCase();
        return currCourseKey === courseKey && thisClass.classNumber !== c.classNumber;
    });

    return relatedClasses;
}

interface RelatedClassesProps {
    classNumber: number;
}

export default function RelatedClassesBar({ classNumber } : RelatedClassesProps) {
    const [relatedClasses, setRelatedClasses] = useState<ClassRow[]>([]);
    const [showClasses, setShowClasses] = useState<boolean>(false);

    useEffect( () => {
        const getRelatedClasses = async () => {
            if (!classNumber) return;

            const c = await findRelatedClasses(classNumber);
            setRelatedClasses(c);
        }

        getRelatedClasses();
    }, [classNumber]);

    return (
        <div className="flex flex-col p-5 gap-2 rounded-lg bg-neutral-500 w-[100%]">
            <button className="text-3xl text-left"
                    onClick={() => {
                        setShowClasses( prev => (!prev));
                    }}
            > 
                Other Sections
            </button>
            {showClasses &&
            <div className="flex flex-row gap-4 overflow-auto">
                {relatedClasses.map( (c, i) => (
                    <RelatedClassTile c={c} key={c.classNumber}/>
                ))}
            </div>}
        </div>
    );
}

interface RelatedClassTileProp {
    c: ClassRow;
}

function RelatedClassTile({c} : RelatedClassTileProp) {
    const [profRatings, setProfRatings] = useState<professorRating | null>(null);
    const navigate = useNavigate();

    useEffect( () => {
        const p = async () => {
            const profRes = await getProfessor(c.instructor);
            if (!profRes) {
                console.error("couldnt get/find professor");
                return
            }
            setProfRatings(profRes.ratings);
        }

        p();
    }, [])

    const difficultyBg = (r: number | null) => {
        if (!r) return "bg-black-100";
        if (r >= 4) return "bg-green-600";
        if (r >= 3) return "bg-yellow-500";
        return "bg-red-600";
    };

    return(
        <div className="flex flex-col rounded-sm border border-2 border-solid p-2 my-2 justify-between text-lg min-w-[200px] bg-neutral-700
                        hover:bg-neutral-800 duration-300 cursor-pointer"
            onClick={() => {navigate(`/class/${c.classNumber}`)}}
        >
            <div className="text-sm">
                {c.courseTitle} ({c.section})
            </div>
            <div>
                {c.location}
            </div>
            <div>
                {c.days} {c.times}
            </div>
            <div className="flex flex-row gap-2 justify-between items-center">
                {c.instructor}
                <div className={`grid w-8 h-8 grid w-8 h-8 shrink-0 place-items-center rounded text-sm font-semibold
                    ${profRatings ? difficultyBg(profRatings?.avgDifficulty) : 0}`}
                >
                    {profRatings ? profRatings.avgDifficulty : "" }
                </div>
            </div>
        </div>
    );
}