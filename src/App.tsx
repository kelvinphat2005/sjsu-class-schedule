import { useState, useEffect, useMemo, useDeferredValue } from 'react'
import { Outlet } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import { convertTo24Hour } from './components/Calendar';
import { signal, effect } from '@preact/signals-react';
import { getItem, setItem } from './utils/LocalStorage';
import type { CalendarClass } from './components/Calendar';
import type { ClassRow } from './scraper/ClassSchedulesScraper'

import { ClassTile } from './components/ClassTile';

import { getClassesAPI } from './scraper/ClassServerClient';

import { Virtuoso } from 'react-virtuoso'


import { usePersistedState } from './hooks/usePersistedState';

type filters = {
  favorites: boolean;
  openSeats: boolean;
}

export const calendarClasses = signal<CalendarClass[]>(getItem("calendarClasses") || []);

function App() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [q, setQ] = useState("");
  const { pathname } = useLocation();
  const [calendarViewEnabled, setCalendarViewEnabled] = useState<boolean>(false);
  // stored as array of classNumbers
  const [favorites, setFavorites] = usePersistedState<number[]>("favorites", []);
  const [filters, setFilters] = useState<filters>({
    favorites: false,
    openSeats: false,
  });

  effect(() => setItem("calendarClasses", calendarClasses.value));

  useEffect(() => {
    console.log("main",pathname);
    if (pathname === "/calendar") {
      setCalendarViewEnabled(true);
    } else {
      setCalendarViewEnabled(false);
    }
  }, [pathname])

  useEffect(() => {
    // fetch classes from API
    const loadClasses = async () => {
      const cl = await getClassesAPI();
      setClasses(cl);

      console.log("fetched classes: ", cl);
    }
    loadClasses();
  }, [])


  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    const norm = (v: unknown) => String(v ?? "").toLowerCase();

    let filtered = classes.filter((r) => {
      const subjectCourse = `${norm(r.subject)} ${norm(r.course)}`;
      return (
        subjectCourse.includes(term) ||
        norm(r.section).includes(term) ||
        norm(r.courseTitle).includes(term) ||
        norm(r.instructor).includes(term) ||
        norm(r.location).includes(term) ||
        norm(r.type).includes(term) ||
        norm(r.days).includes(term) ||
        String(r.classNumber ?? "").includes(term)
      );
    });

    if (filters.favorites) {
      filtered = filtered.filter((r) => {
        return favorites.includes(r.classNumber);
      })
    }

    if (filters.openSeats) {
      filtered = filtered.filter((r) => {
        return r.openSeats > 0;
      })
    }

    return filtered;

  }, [q, classes, filters, favorites]);

  const handleFavorites = (classNumber: number) => {
    console.log(classNumber);
    if (favorites.includes(classNumber)) {
      setFavorites(prev => prev.filter(cn => cn !== classNumber));
      return;
    }
    setFavorites(prev => [...prev, classNumber]);
  }

  const handleAddToCalendar = (c: ClassRow) => {
    console.log("add to calendar", c);
    const label = `${c.subject} ${c.course}`;
    
    const add : CalendarClass[] = parseDays(c.days).map((d) => ({
      time: {
        day: d,
        from: convertTo24Hour(c.times.split("-")[0]),
        to: convertTo24Hour(c.times.split("-")[1]),
      },
      label: label,
      location: c.location,
      professor: c.instructor, 
    }));
    calendarClasses.value = [...calendarClasses.value, ...add];
  }


  return (
    <div className="h-screen flex gap-4 bg-neutral-800 p-2 overflow-hidden">
      {/* Class List (left) */}
      <div className="w-[500px] h-full rounded-lg bg-neutral-700 p-3 min-h-0 overflow-hidden flex flex-col">
        {/* Search bar (sticky) */}
        <div className="sticky top-0 z-10 bg-neutral-700 pb-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by subject, number, title, instructor…"
            className="w-full rounded-md bg-neutral-800 text-neutral-100 px-3 py-2 outline-none ring-1 ring-neutral-600 focus:ring-neutral-300"
          />

        <div className="flex flex-row mt-2 gap-1">
          {/** filters */}
          <button
            type="button"
            aria-pressed={filters.favorites}
            onClick={() =>
              setFilters((f) => ({ ...f, favorites: !f.favorites }))
            }
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition
              ring-1 ring-neutral-600
              ${filters.favorites
                ? "bg-yellow-400 text-black hover:brightness-95"
                : "bg-neutral-800 text-neutral-100 hover:bg-neutral-750"
              }`}
            title={filters.favorites ? "Showing favorites only" : "Show favorites only"}
          >
            <span aria-hidden>★ Favorites</span> 
          </button>

          <button
            type="button"
            aria-pressed={filters.openSeats}
            onClick={() =>
              setFilters((f) => ({ ...f, openSeats: !f.openSeats }))
            }
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition
              ring-1 ring-neutral-600
              ${filters.openSeats
                ? "bg-yellow-400 text-black hover:brightness-95"
                : "bg-neutral-800 text-neutral-100 hover:bg-neutral-750"
              }`}
            title={filters.openSeats ? "Showing open seats only" : "Show open seats  only"}
          >
            <span aria-hidden>🪑 Open Seats</span> 
          </button>
        </div>  

          <div className="mt-1 text-xs text-neutral-300">
            {filtered.length} / {classes.length}
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 min-h-0">
          <Virtuoso
            className="h-full gap-2"
            data={filtered}
            computeItemKey={(_, it) => it.classNumber}
            itemContent={(_, item) =>
              <div>
                <ClassTile classRow={item}
                  onFavoritesClick={() => { handleFavorites(item.classNumber) }}
                  isFavorited={favorites.includes(item.classNumber)}
                  addToCalendar={calendarViewEnabled ? () => {handleAddToCalendar(item)} : undefined}
                />
              </div>}
          />
        </div>
      </div>

      {/* Class Details (right) */}
      <div className="flex-1 overflow-y-auto rounded-lg min-h-0 bg-neutral-700 p-3">
        <Outlet />
      </div>
    </div>


  )
}

export default App

function parseDays(days: string): ("M" | "T" | "W" | "R" | "F")[] {
  const tokens = days.toUpperCase().replace(/\s+/g, "").match(/TH|TU|[MTWRF]/g) ?? [];
  return tokens
    .map((t) => {
      switch (t) {
        case "M":  return "M";
        case "W":  return "W";
        case "F":  return "F";
        case "TH": return "R"; // Thursday → R
        case "TU": return "T"; // Tuesday → T
        case "T":  return "T"; // plain T = Tuesday
        case "R":  return "R"; // already R = Thursday
        default:   return null;
      }
    })
    .filter(Boolean) as ("M" | "T" | "W" | "R" | "F")[];
}