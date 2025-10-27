import React, { useMemo } from "react";
import type { ClassRow } from "@/types/domain";

const DAY_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const tokenMap: Record<string, number> = { mon:0, m:0, tue:1, tu:1, t:1, wed:2, w:2, thu:3, th:3, r:3, fri:4, f:4, sat:5, sa:5, s:5, sun:6, su:6, u:6 };

const PX_PER_30 = 36;            // was 24
const PX_PER_HOUR = PX_PER_30*2; // was 48

const timeToMin = (t: string) => {
  const m = t.trim().replace(/(am|pm)$/i, " $1").match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!m) return null;
  let h = +m[1], min = +(m[2] ?? 0); const ap = m[3].toUpperCase();
  if (ap === "AM") h = h === 12 ? 0 : h; else h = h === 12 ? 12 : h + 12;
  return h * 60 + min;
};
const parseRange = (s: string) => {
  if (!s || /tba|arr/i.test(s)) return null;
  const [a,b] = s.split("-").map(x=>x.trim()); const A=timeToMin(a||""), B=timeToMin(b||"");
  return A!=null && B!=null && B>A ? {start:A, end:B} : null;
};
const parseDays = (s: string) => {
  if (!s || /tba|arr/i.test(s)) return [];
  const found = s.replace(/\//g," ").match(/Mon|Tue|Wed|Thu|Fri|Sat|Sun|Tu|Th|Sa|Su|[MTWRFSU]/gi) || [];
  return Array.from(new Set(found.map(t => tokenMap[t.toLowerCase()]).filter(v => v!=null)));
};
const fmt = (m: number) => {
  const h24 = Math.floor(m/60), mm = (m%60).toString().padStart(2,"0"), ap = h24>=12?"PM":"AM";
  const h12 = h24%12===0?12:h24%12; return `${h12}:${mm} ${ap}`;
};
const color = (k: number) =>
  ["bg-blue-500","bg-emerald-500","bg-amber-500","bg-fuchsia-500","bg-cyan-500","bg-rose-500","bg-violet-500","bg-lime-600"][Math.abs(k)%8];

type Event = { d:number; start:number; end:number; row:ClassRow; key:string };

export default function Calendar({ rows, onRemove }: { rows: ClassRow[]; onRemove?: (id: number) => void }) {
  const events = useMemo<Event[]>(() => rows.flatMap(r => {
    const dr = parseRange(r.times); const ds = parseDays(r.days);
    if (!dr || !ds.length) return [];
    return ds.map(d => ({ d, start: dr.start, end: dr.end, row: r, key: `${r.classNumber}-${d}-${dr.start}` }));
  }), [rows]);

  const [minMin, maxMin] = [6 * 60, 22 * 60];

  const halfRows = Math.max(1, (maxMin - minMin)/30);
  const hourMarks = useMemo(() => {
    const a:number[]=[]; for (let m=minMin; m<=maxMin; m+=60) a.push(m); return a;
  }, [minMin, maxMin]);

  const byDay = useMemo(() => {
    const m: Record<number, Event[]> = {0:[],1:[],2:[],3:[],4:[],5:[],6:[]};
    for (const e of events) m[e.d].push(e);
    for (const d of Object.keys(m)) m[+d].sort((x,y)=>x.start-y.start);
    return m;
  }, [events]);

  return (
    <div className="w-full">
      {/* Mobile agenda */}
      <div className="md:hidden space-y-4">
        {DAY_LABELS.map((lbl, d) => (
          <div key={lbl}>
            <div className="mb-1 text-sm font-semibold text-gray-700">{lbl}</div>
            <div className="space-y-2">
              {byDay[d].length ? byDay[d].map(e => (
                <div key={e.key} className="relative rounded-lg border p-3">
                  <button
                    type="button"
                    className="absolute right-2 top-2 text-xs opacity-70 hover:opacity-100"
                    onClick={() => onRemove?.(e.row.classNumber)}
                    aria-label="Remove class"
                    title="Remove"
                  >
                    ×
                  </button>
                  <div className="text-sm font-medium">
                    {e.row.subject} {e.row.course}-{e.row.section} · {e.row.courseTitle}
                  </div>
                  <div className="text-xs text-gray-600">
                    {fmt(e.start)}–{fmt(e.end)} · {e.row.location} · {e.row.type}
                  </div>
                  {/* instructor already shown on mobile */}
                  <div className="mt-1 text-xs text-gray-500">{e.row.instructor}</div>
                </div>
              )) : <div className="text-xs text-gray-4 00">No classes</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop weekly grid */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[64px_repeat(7,1fr)] gap-x-2">
          <div />
          {DAY_LABELS.map(d => <div key={d} className="py-2 text-center text-sm font-semibold text-gray-700">{d}</div>)}

          {/* time rail */}
          <div
            className="relative border-r"
            style={{
              height: `${halfRows*PX_PER_30}px`,                      // was *24
              backgroundImage:"linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)",
              backgroundSize:`100% ${PX_PER_HOUR}px`                  // was 48px
            }}
          >
            {hourMarks.map(m => (
              <div
                key={m}
                className="absolute right-2 -translate-y-2 text-[10px] text-gray-500"
                style={{ top: `${((m-minMin)/30)*PX_PER_30}px` }}
              >
                {fmt(m)}
              </div>
            ))}
          </div>

          {/* day columns */}
          {Array.from({length:7}).map((_, day) => (
            <div
              key={day}
              className="relative rounded-md border"
              style={{
                height:`${halfRows*PX_PER_30}px`,                     // was *24
                backgroundImage:"linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)",
                backgroundSize:`100% ${PX_PER_HOUR}px`                // was 48px
              }}
            >
              {events.filter(e=>e.d===day).map((e) => {
                const top = ((e.start - minMin)/30)*PX_PER_30 + 2;    // was *24
                const height = ((e.end - e.start)/30)*PX_PER_30 - 4;  // was *24
                return (
                  <div
                    key={e.key}
                    className={`absolute ${color(e.row.classNumber)} text-white rounded-md shadow-sm overflow-hidden`}
                    style={{ top, left: 6, right: 6, height, padding: "6px 8px" }}
                    title={`${e.row.subject} ${e.row.course}-${e.row.section} • ${fmt(e.start)}–${fmt(e.end)} • ${e.row.location}`}
                  >
                    <button
                      type="button"
                      className="absolute right-1 top-0.5 text-xs leading-none opacity-80 hover:opacity-100"
                      onClick={() => onRemove?.(e.row.classNumber)}
                      aria-label="Remove class"
                      title="Remove"
                    >
                      ×
                    </button>

                    <div className="text-[11px] font-semibold leading-tight pr-4 whitespace-nowrap truncate">
                      {e.row.subject} {e.row.course}-{e.row.section} · {e.row.type}
                    </div>
                    <div className="text-[10px] leading-tight opacity-95 whitespace-nowrap truncate">
                      {fmt(e.start)}–{fmt(e.end)} · {e.row.location}
                    </div>
                    <div className="text-[10px] leading-tight truncate opacity-90">
                      {e.row.courseTitle}
                    </div>
                    {/* NEW: professor/instructor line on desktop */}
                    <div className="text-[10px] leading-tight truncate opacity-90">
                      {e.row.instructor}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
