import { getClassesSync } from "@/lib/classes";
import ScheduleView from "@/components/ScheduleView";

export default function Page() {
  const { rows } = getClassesSync();

  return (
    <main className="h-full">
      <ScheduleView rows={rows} />
    </main>
  );
}