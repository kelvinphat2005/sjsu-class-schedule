"use client";

import { useState, useCallback, useMemo } from "react";
import ClassList from "@/components/ClassList";
import DetailsPane from "@/components/DetailsPane";
import type { ClassRow } from "@/types/domain";

type Props = { rows: ClassRow[] };

export default function ScheduleView({ rows }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleSelect = useCallback((row: ClassRow) => {
    setSelectedId(row.classNumber);
  }, []);

  const selectedRow = useMemo(
    () => (selectedId == null ? null : rows.find(r => r.classNumber === selectedId) ?? null),
    [rows, selectedId]
  );

  return (
    <div className="flex h-full min-h-0">
      <div className="w-[28rem] border-r min-h-0 overflow-hidden">
        <ClassList rows={rows} selectedId={selectedId ?? undefined} onSelect={handleSelect} />
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-4">
        <DetailsPane id={selectedId} row={selectedRow} />
      </div>
    </div>
  );
}
