import { getDb } from "@/lib/db";
import { mentors } from "@/lib/schema";
import type { Mentor, FunnelMetrics } from "@/lib/types";
import { Header } from "@/components/Header";
import { RatesBar } from "@/components/RatesBar";
import { MentorTable } from "@/components/MentorTable";
import { isGmailConfigured } from "@/lib/gmail";

export const dynamic = "force-dynamic";

async function loadData(): Promise<{ rows: Mentor[]; metrics: FunnelMetrics; gmailReady: boolean }> {
  const db = getDb();
  const gmailReady = isGmailConfigured();

  if (!db) {
    return {
      rows: [],
      metrics: { total: 0, sent: 0, replied: 0, bounced: 0 },
      gmailReady,
    };
  }

  const rows = (await db.select().from(mentors).orderBy(mentors.waveDay, mentors.id)) as Mentor[];

  const metrics: FunnelMetrics = {
    total: rows.length,
    sent: rows.filter((r) => ["sent", "replied", "bounced"].includes(r.sendStatus)).length,
    replied: rows.filter((r) => r.sendStatus === "replied").length,
    bounced: rows.filter((r) => r.sendStatus === "bounced").length,
  };

  return { rows, metrics, gmailReady };
}

export default async function Home() {
  const { rows, metrics, gmailReady } = await loadData();

  return (
    <main className="min-h-screen bg-bg">
      <Header total={metrics.total} gmailReady={gmailReady} />
      <RatesBar metrics={metrics} total={rows.length} />
      <MentorTable initial={rows} gmailReady={gmailReady} />
    </main>
  );
}
