import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { mentors, sendEvents } from "@/lib/schema";
import { checkThreadForReply, findBounceForThread, isGmailConfigured } from "@/lib/gmail";
import { eq, inArray } from "drizzle-orm";

export async function POST() {
  if (!isGmailConfigured()) {
    return NextResponse.json({ error: "Gmail not configured" }, { status: 400 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

  const sent = await db
    .select()
    .from(mentors)
    .where(inArray(mentors.sendStatus, ["sent"]));

  let replied = 0;
  let bounced = 0;

  for (const mentor of sent) {
    if (!mentor.gmailThreadId) continue;

    try {
      const isBounced = await findBounceForThread(mentor.gmailThreadId);
      if (isBounced) {
        await db
          .update(mentors)
          .set({ sendStatus: "bounced", bouncedAt: new Date() })
          .where(eq(mentors.id, mentor.id));
        await db.insert(sendEvents).values({ mentorId: mentor.id, eventType: "bounced" });
        bounced++;
        continue;
      }

      const hasReply = await checkThreadForReply(mentor.gmailThreadId);
      if (hasReply) {
        await db
          .update(mentors)
          .set({ sendStatus: "replied", repliedAt: new Date() })
          .where(eq(mentors.id, mentor.id));
        await db.insert(sendEvents).values({ mentorId: mentor.id, eventType: "replied" });
        replied++;
      }
    } catch {
      // Skip individual failures - don't block the whole sync
    }
  }

  return NextResponse.json({ checked: sent.length, replied, bounced });
}
