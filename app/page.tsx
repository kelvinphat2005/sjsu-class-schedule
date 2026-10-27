import { getClassesSync } from "@/lib/classes";

import ScheduleView from "@/components/ScheduleView";

export const dynamic = "force-dynamic";

export default async function Page() {
  const result = await getClassesSync();
  const rows = result?.rows ?? [];

  return (
    <main className="h-full">
      <ScheduleView rows={rows} />
    </main>
  );
}