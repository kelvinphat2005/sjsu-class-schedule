
export type TimePeriod = {
  day: "M" | "T" | "W" | "R" | "F";
  to: string; // in HH:MM 24hr format
  from: string; // in HH:MM 24hr format
}

export type CalendarClass = {
  time: TimePeriod;
  label: string;
  location: string;
  professor: string;
  
}

interface CalendarProps {
  classes?: CalendarClass[];
  onDelete?: (c: CalendarClass) => void;
}

// dive each day into 15 minutes increments from 6am to 12am
// fill with color if class is scheduled

export default function Calendar({ classes, onDelete }: CalendarProps) {
  const mondayClasses = classes?.filter(c => c.time.day === "M") || [];
  const tuesdayClasses = classes?.filter(c => c.time.day === "T") || [];
  const wednesdayClasses = classes?.filter(c => c.time.day === "W") || [];
  const thursdayClasses = classes?.filter(c => c.time.day === "R") || [];
  const fridayClasses = classes?.filter(c => c.time.day === "F") || [];

  return (
    <div className="flex flex-row">
      {hoursColumn("06:00", "24:00")}
      <CalendarColumn label="Monday" classes={mondayClasses} onDelete={onDelete}/>
      <CalendarColumn label="Tuesday" classes={tuesdayClasses} onDelete={onDelete}/>
      <CalendarColumn label="Wednesday" classes={wednesdayClasses} onDelete={onDelete}/>
      <CalendarColumn label="Thursday" classes={thursdayClasses} onDelete={onDelete}/>
      <CalendarColumn label="Friday" classes={fridayClasses} onDelete={onDelete}/>
    </div>
  );
}

interface CalendarColumnProps {
  classes?: CalendarClass[];
  label: string;
  increment?: number, // default 15 mins
  startHour?: number,
  endHour?: number,
  onDelete?: (c: CalendarClass) => void;
}



function CalendarColumn({ classes, label, onDelete, increment = 15, startHour = 6, endHour = 24 }: CalendarColumnProps) {
  const SLOTS_PER_HOUR = 60 / increment; // e.g. 4
  const SLOT_H = 15;                     // px per slot (15px per 15-min)
  const PX_PER_MIN = SLOT_H / increment; // 1 px per minute (with defaults)

  const totalMinutes = (endHour - startHour) * 60;
  const totalSlots = (endHour - startHour) * SLOTS_PER_HOUR;

  // Helpers
  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

  return (
    <div className="flex flex-col border-y border-neutral-700">
      <div className="flex border-y border-neutral-700 w-[150px] p-2">{label}</div>

      {/* Column canvas */}
      <div className="relative w-[150px]" style={{ height: totalMinutes * PX_PER_MIN }}>
        {/* Background grid in 15-min increments (optional) */}
        {Array.from({ length: totalSlots }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-neutral-300"
            style={{ top: i * SLOT_H }}
          />
        ))}

        {/* Class blocks (absolute, minute-precise) */}
        {classes?.map((c, idx) => {
          const fromAbs = toMinutes(c.time.from);
          const toAbs = toMinutes(c.time.to);

          const startMin = clamp(fromAbs - startHour * 60, 0, totalMinutes);
          const endMin = clamp(toAbs - startHour * 60, 0, totalMinutes);

          const top = startMin * PX_PER_MIN;
          const height = Math.max(8, (endMin - startMin) * PX_PER_MIN); // min height for visibility

          return (
            <div
              key={idx}
              className="absolute left-0 right-0 rounded bg-blue-600 text-white border border-neutral-300 overflow-hidden flex items-center justify-center"
              style={{ top, height }}
              title={`${c.label} • ${c.professor} • ${c.location} • ${c.time.from}–${c.time.to}`}
            >
              {/* X button */}
              <button
                type="button"
                className="absolute top-1 right-1 h-5 w-5 rounded bg-black/40 hover:bg-black/60 leading-none"
                onClick={(e) => { e.stopPropagation(); onDelete?.(c); }}
                aria-label="Remove from calendar"
                title="Remove"
              >
                ×
              </button>

              <div className="text-xs font-bold text-center leading-tight px-1 pointer-events-none">
                {c.label}<br />{c.location}<br />{c.professor}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function hoursColumn(from: string, to: string) {
  const fromHour = parseInt(from.split(":")[0]);
  const fromMinute = parseInt(from.split(":")[1]);

  const toHour = parseInt(to.split(":")[0]);
  const toMinute = parseInt(to.split(":")[1]);

  const totalHours = toHour - fromHour + (toMinute - fromMinute) / 60;

  return (
    <>
      <div className="flex flex-col border border-x-0">
      {Array.from({ length: totalHours }).map((_, i) => {
        const hour = (fromHour + i) % 24;
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? "PM" : "AM";
        return (
          <div key={i} className="flex border border-neutral-300 border-x-0 h-[60px] w-[50px]">
            {displayHour}:00 {ampm}
          </div>
        )
      })}
    </div>
    </>
    
  )
}

// convert HH:MMAM/PM to HH:MM 24hr format
export function convertTo24Hour(time: string): string {
  const s = time.trim().toUpperCase();

  // already 24h? "00:00".."23:59"
  const m24 = s.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (m24) return `${m24[1]}:${m24[2]}`;

  // 12h with AM/PM
  const m12 = s.match(/^(\d{1,2}):([0-5]\d)\s*([AP])M$/);
  if (!m12) throw new Error(`Invalid time: ${time}`);

  let [, hh, mm, ap] = m12;
  let h = parseInt(hh, 10);
  if (h < 1 || h > 12) throw new Error(`Hour out of range: ${time}`);

  if (ap === "A") {
    if (h === 12) h = 0;        // 12:xx AM -> 00:xx
  } else {
    if (h !== 12) h += 12;       // 1–11 PM -> add 12
  }
  return `${h.toString().padStart(2, "0")}:${mm}`;
}

// helper to split "03:00PM-04:15PM" (with or without spaces / en-dash)
export function splitTimes(span: string) {
  const m = span.trim().match(/^(.+?)\s*[-–—]\s*(.+)$/);
  if (!m) throw new Error(`Bad time span: ${span}`);
  return { start: m[1], end: m[2] };
}