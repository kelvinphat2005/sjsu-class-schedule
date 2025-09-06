import { useState, useEffect, useMemo, useDeferredValue } from 'react'
import { Outlet } from "react-router-dom";

import type { ClassRow } from './scraper/ClassSchedulesScraper'

import { ClassTile } from './components/ClassTile';

import { getClassesAPI } from './scraper/ClassServerClient';

import { Virtuoso } from 'react-virtuoso'

import { currProfessorSignal } from './components/ClassPage';
//import { useClasses } from './context/ClassContext';

function App() {
  const [classes, setClasses] = useState<ClassRow[]>([]);

  const [q, setQ] = useState("");
  const deferredQ = useDeferredValue(q);

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
    const term = deferredQ.trim().toLowerCase();
    if (!term) return classes;

    const norm = (v: unknown) => String(v ?? "").toLowerCase();
    return classes.filter((r) => {
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
  }, [deferredQ, classes]);


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
            itemContent={(_, item) => <div><ClassTile classRow={item} /></div>}
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
