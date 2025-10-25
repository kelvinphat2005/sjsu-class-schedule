"use client";

import React, { useMemo, useState, useCallback } from "react";
import { Virtuoso } from "react-virtuoso";
import ClassTile from "@/components/ClassTile";
import type { ClassRow } from "@/types/domain";
import { useLocalStorage } from "@/lib/localStore";

type Props = {
  rows: ClassRow[];
  selectedId?: number;
  onSelect?: (row: ClassRow) => void;
};

const FAV_KEY = "sjsu:favorites"; // you can reuse this key anywhere else

function matchesQuery(row: ClassRow, q: string) {
  if (!q) return true;
  const s = q.toLowerCase().trim();
  if (!s) return true;
  const hay = [
    row.subject,
    row.course,
    `${row.subject} ${row.course}`,
    row.courseTitle,
    row.instructor,
    row.location,
    row.days,
    row.times,
    row.section,
    row.dates,
    row.type,
    row.modeOfInstruction,
    row.satisfies,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(s);
}

export default function ClassList({ rows, selectedId, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [openOnly, setOpenOnly] = useState(false);

  // store favorites in localStorage
  const [favIds, setFavIds] = useLocalStorage<number[]>(FAV_KEY, []);
  const favSet = useMemo(() => new Set(favIds), [favIds]);

  const toggleFavorite = useCallback((id: number) => {
    setFavIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }, [setFavIds]);

  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // filters
  const filtered = useMemo(() => {
    let base = rows;
    if (favoritesOnly) base = base.filter(r => favSet.has(r.classNumber));
    if (openOnly) base = base.filter(r => Number(r.openSeats) > 0);
    if (query) base = base.filter(r => matchesQuery(r, query));
    return base;
  }, [rows, query, openOnly, favoritesOnly, favSet]);

  const renderItem = useCallback(
    (_: number, row: ClassRow) => {
      const isFav = favSet.has(row.classNumber);
      return (
        <div className="relative p-2 w-full">
          {/* Favorite star (doesn’t trigger select) */}
          <button
            type="button"
            title={isFav ? "Unfavorite" : "Favorite"}
            aria-pressed={isFav}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(row.classNumber);
            }}
            className={[
              "absolute right-4 top-4 inline-flex items-center justify-center",
              "rounded-full border px-2 py-1 text-base leading-none transition",
              isFav
                ? "bg-yellow-400 text-black border-yellow-400 shadow"
                : "bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50",
            ].join(" ")}
          >
            {isFav ? "★" : "☆"}
          </button>

          <ClassTile
            row={row}
            selected={row.classNumber === selectedId}
            onSelect={onSelect}
          />
        </div>
      );
    },
    [onSelect, selectedId, favSet, toggleFavorite]
  );

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="border-b p-2 space-y-2 sticky top-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur z-10">
        <input
          aria-label="Search classes"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search subject, code, title, instructor, time…"
          className="w-full rounded-full border px-4 py-2 text-sm outline-none focus:ring-2"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed={openOnly}
            onClick={() => setOpenOnly((v) => !v)}
            className={[
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm border transition",
              openOnly ? "bg-blue-600 text-white border-blue-600 shadow" : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50",
            ].join(" ")}
          >
            Open seats only
          </button>

          <button
            type="button"
            aria-pressed={favoritesOnly}
            onClick={() => setFavoritesOnly((v) => !v)}
            className={[
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm border transition",
              favoritesOnly ? "bg-amber-500 text-black border-amber-500 shadow" : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50",
            ].join(" ")}
          >
            ★ Favorites
          </button>

          <span className="ml-auto text-xs text-zinc-500">
            {filtered.length.toLocaleString()} result{filtered.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0">
        <Virtuoso<ClassRow>
          style={{ height: "100%" }}
          data={filtered}
          itemContent={renderItem}
          computeItemKey={(_, row) => row.classNumber} // stable scroll
        />
      </div>
    </div>
  );
}
