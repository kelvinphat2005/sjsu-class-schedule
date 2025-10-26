"use client";

import { useEffect, useState } from "react";
import type { ClassDetails, ClassRow } from "@/types/domain";
import RmpPanel from "@/components/RmpPanel";

type Props = { id: number | null; row?: ClassRow | null };

export default function DetailsPane({ id, row }: Props) {
    const [data, setData] = useState<ClassDetails | null>(null);
    const [stale, setStale] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        if (!id) {
            setData(null);
            setErr(null);
            setStale(false);
            return;
        }
        setLoading(true);
        setErr(null);
        setStale(false);

        fetch(`/api/classes/${id}/details`, { cache: "no-store" })
            .then(async (r) => {
                if (!r.ok) {
                    const body = await r.json().catch(() => ({} as any));
                    throw new Error(body?.error || `HTTP ${r.status}`);
                }
                return r.json() as Promise<{ course: ClassDetails; stale?: boolean }>;
            })
            .then(({ course, stale }) => {
                if (cancelled) return;
                setData(course);
                setStale(Boolean(stale));
            })
            .catch((e) => {
                if (cancelled) return;
                setErr(e.message || "Failed to load details");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (!id) return <div className="text-sm text-zinc-500">Select a class to see details.</div>;
    if (loading) return <div className="text-sm text-zinc-500">Loading…</div>;
    if (err) {
        return <div className="text-sm text-red-600">Couldn’t load details ({err}). Try again in a moment.</div>;
    }
    if (!data) return null;

    const profName = row?.instructor ? normalizeProfessorName(row.instructor) : null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: long-form details */}
            <article className="prose prose-zinc dark:prose-invert max-w-none lg:col-span-2">
                <header className="mb-4">
                    <h2 className="m-0">{data.courseTitle}</h2>
                    <p className="m-0 text-sm text-zinc-500">
                        {data.courseKey} · {data.credits} credits {stale && <span className="ml-2">· (cached)</span>}
                    </p>
                </header>

                {data.description && <Label header="Description" value={data.description} />}

                {data.prereq && <Label header="Prerequisites" value={data.prereq} />}

                {data.satisfies && <Label header="Satisfies" value={data.satisfies} />}

                {data.grading && <Label header="Grading" value={data.grading} />}

                {data.notes && <Label header="Notes" value={data.notes} />}
            </article>

            {/* Right: compact “box” with roster/meeting info */}
            <aside className="lg:col-span-1">
                <div className="rounded-xl border p-4 sticky top-4">
                    <h3 className="text-sm font-semibold mb-3">Class info</h3>
                    {row ? (
                        <dl className="text-sm grid grid-cols-3 gap-x-3 gap-y-2">
                            <dt className="col-span-1 text-zinc-500">Professor</dt>
                            <dd className="col-span-2">{profName || "TBA"}</dd>

                            <dt className="col-span-1 text-zinc-500">Section</dt>
                            <dd className="col-span-2">{row.section}</dd>

                            <dt className="col-span-1 text-zinc-500">Class #</dt>
                            <dd className="col-span-2">{row.classNumber}</dd>

                            <dt className="col-span-1 text-zinc-500">When</dt>
                            <dd className="col-span-2">{[row.days, row.times].filter(Boolean).join(" • ") || "TBA"}</dd>

                            <dt className="col-span-1 text-zinc-500">Location</dt>
                            <dd className="col-span-2">{row.location || "TBA"}</dd>

                            <dt className="col-span-1 text-zinc-500">Mode</dt>
                            <dd className="col-span-2">{row.modeOfInstruction}</dd>

                            <dt className="col-span-1 text-zinc-500">Units</dt>
                            <dd className="col-span-2">{row.units}</dd>

                            <dt className="col-span-1 text-zinc-500">Open seats</dt>
                            <dd className="col-span-2">{row.openSeats}</dd>

                            {row.satisfies ? (
                                <>
                                    <dt className="col-span-1 text-zinc-500">Satisfies</dt>
                                    <dd className="col-span-2">{row.satisfies}</dd>
                                </>
                            ) : null}

                            {row.notes ? (
                                <>
                                    <dt className="col-span-1 text-zinc-500">Notes</dt>
                                    <dd className="col-span-2">{row.notes}</dd>
                                </>
                            ) : null}
                        </dl>
                    ) : (
                        <p className="text-sm text-zinc-500">Basic class info unavailable.</p>
                    )}
                </div>
            </aside>


            {profName && profName !== "TBA" && (
                <div className="rounded-xl border p-4 mt-4 lg:col-span-3">
                    <h3 className="text-sm font-semibold mb-3">Professor ratings</h3>
                    <RmpPanel professorName={profName} />
                </div>
            )}
        </div>
    );
}

interface LabelProps {
    header: string;
    value: string;
}

function Label({ header, value }: LabelProps) {
    return (
        <div className="flex flex-col">
            <div>
                <h2 className="font-bold">{header}</h2>
            </div>
            <div>
                <span>{value}</span>
            </div>
        </div>
    )
}

const normalizeProfessorName = (name: string) => {
    const cleaned = name.replace(/\s*\(.*?\)\s*$/, "").trim();
    const parts = cleaned.split(",").map(s => s.trim()).filter(Boolean);
    return parts.length === 2 ? `${parts[1]} ${parts[0]}` : cleaned;
};
