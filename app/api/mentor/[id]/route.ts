import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { mentors } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

  const id = parseInt(params.id, 10);
  const body = await req.json();

  const updates: Partial<{ subject: string; body: string; sendStatus: string }> = {};
  if (typeof body.subject === "string") updates.subject = body.subject;
  if (typeof body.body === "string") updates.body = body.body;
  if (typeof body.sendStatus === "string") updates.sendStatus = body.sendStatus;

  await db.update(mentors).set(updates).where(eq(mentors.id, id));
  return NextResponse.json({ ok: true });
}
