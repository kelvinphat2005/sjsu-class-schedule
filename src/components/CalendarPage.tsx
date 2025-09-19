import Calendar from "./Calendar"
import type { CalendarClass } from "./Calendar";
import { useSignals } from '@preact/signals-react/runtime';
import { calendarClasses } from "../App";

interface CalendarPageProps {
    classes: CalendarClass[];
}


export default function CalendarPage() {
    useSignals();

    const handleDelete = (target: CalendarClass) => {
        calendarClasses.value = calendarClasses.value.filter(c => (c.groupKey !== target.groupKey));
    };
    return(
        <>  
            <p className="text-neutral-300">Calendar View</p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded mb-4" onClick={() => {calendarClasses.value = []}}>
                Clear Calendar
            </button>
            <Calendar classes={calendarClasses.value} onDelete={handleDelete}/>
        </>
        
    );
}