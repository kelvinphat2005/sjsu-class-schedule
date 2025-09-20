import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import { getClass, getClassesAPI } from "../scraper/ClassServerClient"
import type { ClassRow } from "../scraper/ClassSchedulesScraper"

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
    const navigate = useNavigate();
    return(
        <div className="flex flex-col rounded-sm border border-2 border-solid p-2 my-2 space-between text-lg min-w-[200px] bg-neutral-700
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
            <div>
                {c.instructor}
            </div>
        </div>
    );
}