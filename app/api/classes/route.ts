import { NextResponse } from "next/server";
import { getClassesSync } from "@/lib/classes";

export const dynamic = "force-dynamic";

export const runtime = "nodejs"; // safe default

export async function GET() {
    const { rows } = await getClassesSync();
    return NextResponse.json({ count: rows.length, rows });
}