"use client";

import Calendar from "./Calendar";
import ClassList from "./ClassList";

import type { ClassRow } from "@/types/domain";
import { useEffect, useState } from "react";

import { useLocalStorage } from "@/lib/localStore";

const CAL_KEY = "sjsu:calendar";

interface CalendarViewProps {
    rows: ClassRow[]
}

export default function CalendarView({ rows } : CalendarViewProps) {
    const [calendarClasses, setCalendarClasses] = useState<ClassRow[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // local storage
    const [storedClasses, setStoredClasses] = useLocalStorage<ClassRow[]>(CAL_KEY, []);

    const dedupeById = (arr: ClassRow[]) => {
        const seen = new Set<number>();
        return arr.filter(x => (seen.has(x.classNumber) ? false : (seen.add(x.classNumber), true)));
    };

    // load from local storage on mount
    useEffect(() => {
        setCalendarClasses(storedClasses);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // add class to calendar
    const handleSelect = (c : ClassRow) => {
        if (!c) return;
        if (calendarClasses.some(x => x.classNumber === c.classNumber)) return;

        const selectedClass = rows.find(row => row.classNumber === c.classNumber);
        if (!selectedClass) return;

        setCalendarClasses(prev => dedupeById([...prev, selectedClass]));
        setStoredClasses(prev => dedupeById([...prev, selectedClass]));
    };

    // r
    const handleRemove = (id: number) => {
        setCalendarClasses(prev => prev.filter(c => c.classNumber !== id));
        setStoredClasses(prev => prev.filter(c => c.classNumber !== id));
    };

    useEffect(() => {
        const cleaned = dedupeById(storedClasses);
        setCalendarClasses(cleaned);
        if (cleaned.length !== storedClasses.length) setStoredClasses(cleaned);
    }, []);

    return (
        <div className="flex flex-col lg:flex-row h-full min-h-0">
            {/* Left: list */}
            <div className="w-full lg:w-[28rem] border-b lg:border-b-0 lg:border-r min-h-0 overflow-auto lg:overflow-hidden">
                <ClassList rows={rows} selectedId={selectedId ?? undefined} onSelect={handleSelect} />
            </div>

            {/* Right: details */}
            <div className="w-full lg:flex-1 min-h-0 overflow-auto p-4">
                <Calendar rows={calendarClasses} onRemove={handleRemove}/>
            </div>
        </div>
    );
}