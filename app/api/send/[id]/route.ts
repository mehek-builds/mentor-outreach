import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { mentors, sendEvents } from "@/lib/schema";
import { sendEmail, isGmailConfigured } from "@/lib/gmail";
import { eq } from "drizzle-orm";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!isGmailConfigured()) {
    return NextResponse.json({ error: "Gmail not configured" }, { status: 400 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

  const id = parseInt(params.id, 10);
  const [mentor] = await db.select().from(mentors).where(eq(mentors.id, id));
  if (!mentor) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (mentor.sendStatus !== "draft" && mentor.sendStatus !== "approved") {
    return NextResponse.json({ error: "Already sent" }, { status: 400 });
  }

  const { messageId, threadId } = await sendEmail(mentor.email, mentor.subject, mentor.body);

  await db
    .update(mentors)
    .set({
      sendStatus: "sent",
      sentAt: new Date(),
      gmailMessageId: messageId,
      gmailThreadId: threadId,
    })
    .where(eq(mentors.id, id));

  await db.insert(sendEvents).values({
    mentorId: id,
    eventType: "sent",
    meta: JSON.stringify({ messageId, threadId }),
  });

  return NextResponse.json({ ok: true, messageId, threadId });
}
