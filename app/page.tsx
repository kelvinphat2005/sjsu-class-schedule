import { getClassesSync } from "@/lib/classes";

import ScheduleView from "@/components/ScheduleView";

export default async function Page() {
  const { rows } = await getClassesSync();

  return (
    <main className="h-full">
      <ScheduleView rows={rows} />
    </main>
  );
}