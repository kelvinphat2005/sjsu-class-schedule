import { NextResponse } from "next/server";
import { getClassesSync } from "@/lib/classes";

export const runtime = "nodejs"; // safe default

export async function GET() {
    const { rows } = getClassesSync();
    return NextResponse.json({ count: rows.length, rows });
}