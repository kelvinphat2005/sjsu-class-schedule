import { getClassesSync } from "@/lib/classes";

import CalendarView from "@/components/CalendarView";


export default async function Page() {
  const { rows } = await getClassesSync();

  return (
    <main className="h-full">
      <CalendarView rows={rows} />
    </main>
  );
}