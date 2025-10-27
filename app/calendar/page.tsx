import { getClassesSync } from "@/lib/classes";

import CalendarView from "@/components/CalendarView";


export default function Page() {
  const { rows } = getClassesSync();

  return (
    <main className="h-full">
      <CalendarView rows={rows} />
    </main>
  );
}