import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { mentors } from "../lib/schema";
import { MENTORS } from "../lib/seed-data";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");

  const sql = neon(url);
  const db = drizzle(sql);

  // Create table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS mentor (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      category TEXT,
      overlap TEXT,
      wave_day INTEGER,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      send_status TEXT NOT NULL DEFAULT 'draft',
      sent_at TIMESTAMP,
      gmail_message_id TEXT,
      gmail_thread_id TEXT,
      replied_at TIMESTAMP,
      bounced_at TIMESTAMP,
      edited_by_user TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS send_event (
      id SERIAL PRIMARY KEY,
      mentor_id INTEGER REFERENCES mentor(id),
      event_type TEXT NOT NULL,
      meta TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Check if already seeded
  const existing = await sql`SELECT COUNT(*) as count FROM mentor`;
  const count = Number(existing[0].count);
  if (count > 0) {
    console.log(`Already seeded: ${count} mentors exist. Skipping.`);
    process.exit(0);
  }

  for (const m of MENTORS) {
    await db.insert(mentors).values({
      name: m.name,
      email: m.email,
      category: m.category,
      overlap: m.overlap,
      waveDay: m.waveDay,
      subject: m.subject,
      body: m.body,
      sendStatus: "draft",
    });
  }

  console.log(`Seeded ${MENTORS.length} mentors.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
