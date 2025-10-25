"use client";

import type { ClassRow } from "@/types/domain";

interface ClassTileProps {
  row: ClassRow;
  selected?: boolean;
  onSelect?: (row: ClassRow) => void;
}

export default function ClassTile({ row, selected = false, onSelect }: ClassTileProps) {
  const code = `${row.subject} ${row.course}`;
  const when = [row.days, row.times].filter(Boolean).join(" • ");

  const base =
    "rounded-xl border p-3 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2";
  const normal = "border-zinc-200 hover:border-zinc-300";
  const active = "border-blue-500 ring-2 ring-blue-500";
  const className = `${base} ${selected ? active : normal}`;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(row)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect?.(row);
      }}
      className={className}
    >
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{code} <span className="text-zinc-500">({row.classNumber})</span></h3>
        <span className="text-xs text-zinc-500">{row.section}</span>
      </header>

      <p className="mt-1 text-sm text-zinc-700">{row.courseTitle}</p>

      {/* Professor */}
      <p className="mt-1 text-xs text-zinc-600">
        <span className="text-zinc-500">Professor: </span>
        {row.instructor || "TBA"}
      </p>

      <dl className="relative z-0 mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div>
          <dt className="text-zinc-500">When</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">{when || "TBA"}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Where</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">{row.location || "TBA"}</dd>
        </div>
      </dl>

      {/* Open seats badge */}
      <div className="mt-2 text-xs">
        <span className="inline-block rounded-full border px-2 py-1">
          Open seats: {Number.isFinite(Number(row.openSeats)) ? row.openSeats : "?"}
        </span>
      </div>
    </article>
  );
}
