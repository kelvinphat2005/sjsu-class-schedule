import { useParams, useLocation } from "react-router";
import type { ClassRow } from "../../server/ClassSchedulesScraper.js";
import type { ClassDetails } from "../../server/CourseCatalogScraper.js";
import type { professorComment, professorRating } from "../../server/RateMyProfessorScraper.js";

import { getClass, getClassDetails } from "../utils/ClassServerClient.js";
import { getProfessor } from "../utils/ClassServerClient.js";

import { useState, useEffect } from "react";

import { signal, computed, effect } from "@preact/signals-react";

import ProfessorRatingDisplay from "./ProfessorRatingDisplay";
import ProfessorCommentsDisplay from "./ProfessorCommentsDisplay";

import RelatedClassesBar from "./RelatedClassesBar";






// send signal to App.tsx to update currProfessor
export const currProfessorSignal = signal<{ professorName: string } | null>(null); //unused

type LocState = { row?: ClassRow };

export default function ClassPage() {
    const { id } = useParams();
    const location = useLocation();
    const initial = (location.state as LocState | undefined)?.row;

    const [currClass, setCurrClass] = useState<ClassRow | undefined>(initial ?? undefined);
    const [currClassDetails, setCurrClassDetails] = useState<ClassDetails | undefined>(undefined);

    const [profComments, setProfComments] = useState<professorComment[] | null>(null);
    const [profRatings, setProfRatings] = useState<professorRating | null>(null);

    useEffect(() => {
        if (!id) return;

        const requestClass = async () => {
            console.log({ id })
            // get basic details
            const r = await getClass(parseInt(id));
            console.log("class", { r });
            setCurrClass(r);

            // get description, prereqs, credits, etc
            const cd = await getClassDetails(parseInt(id));
            setCurrClassDetails(cd);
            console.log("class details", { cd });

            // get professor details
            const profRes = await getProfessor(r.instructor);
            if (!profRes) {
                console.error("couldnt get/find professor");
                return
            }
            setProfComments(profRes.comments);
            setProfRatings(profRes.ratings);
            console.log("professor details", profRes);
        }
        requestClass();

    }, [id]);

    if (!id) return null;
    if (!currClass) return <div>Loading…</div>;

    // set professor
    currProfessorSignal.value = { professorName: currClass.instructor ?? null }; // un used

    return (
        <div className="flex flex-col p-4 gap-3 bg-neutral-600 rounded-lg w-[100%] text-neutral-100">
            <div className="flex flex-row justify-between gap-5">

                {/** class details */}
                <div className="flex flex-col">
                    <div className="text-3xl font-bold">
                        {currClass.subject} {currClass.course} - {currClass.section}
                    </div>

                    <div className="text-5xl font-bold">
                        {currClass.courseTitle}
                    </div>

                    <div className="italic">
                        {currClass.units} units
                    </div>

                    <div>
                        {currClassDetails?.description}
                    </div>

                    <Field label="Satisfies" value={currClassDetails?.satisfies} italic />
                    <Field label="Prerequisites" value={currClassDetails?.prereq ?? currClassDetails?.prereq} />
                    <Field label="Notes" value={currClassDetails?.notes} />
                    <Field label="Grading" value={currClassDetails?.grading} />

                </div>

                {/** repeat classroom details (date, times, location) */}
                <div className="flex flex-col bg-neutral-500 p-4 rounded-lg">
                    <Field label="Classroom" value={currClass.location}/>
                    <Field label="Days" value={currClass.days}/>
                    <Field label="Times" value={currClass.times}/>
                    <Field label="Open Seats" value={currClass.openSeats.toString()}/>
                </div>
            </div>

            {/** related classes */}
            <div className="flex rounded-lg">
                <RelatedClassesBar classNumber={currClass.classNumber}/>
            </div>

            {/** reviews */}
            {profRatings && (
                <ProfessorRatingDisplay rating={profRatings} profId={profRatings.legacyId} />
            )}
            {profComments && (
                <ProfessorCommentsDisplay comments={profComments} />
            )}


        </div>
    );
}

const Field = ({ label, value, italic = false }: { label: string; value?: string | null; italic?: boolean }) => {
    const v = value?.trim();
    if (!v) return null;
    return (
        <div className="space-y-1">
            <div className="text-xl font-bold">{label}</div>
            <div className={italic ? "italic" : undefined}>{v}</div>
        </div>
    );
};