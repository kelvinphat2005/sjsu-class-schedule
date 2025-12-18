import { NextResponse } from "next/server";
import { getClassesSync } from "@/lib/classes";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await ctx.params;
  const id = Number.parseInt(idParam?.trim() ?? "", 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "id must be a number" }, { status: 400 });
  }

  const { byId } = await getClassesSync();
  const row = byId.get(id);
  return row
    ? NextResponse.json(row)
    : NextResponse.json({ error: "class not found" }, { status: 404 });
}
