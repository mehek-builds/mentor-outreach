import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";

const DOSSIER_PATH = "/Users/Mehek1/Documents/Second Brain/4-life/people/mentor-outreach/master-mentor-dossier.md";

// Confirmed sent/replied statuses from Gmail (rows 51-227 only; rows 1-50 already in DB)
const SENT_MAP: Record<string, { status: "sent" | "replied"; sentAt: string; repliedAt?: string; subject: string }> = {
  "codie.sanchez@contrarianthink.com": { status: "sent", sentAt: "2026-06-16T19:09:44Z", subject: "I Walked Away From Finance to Build, Like You" },
  "tiff@tiffintech.com": { status: "sent", sentAt: "2026-06-17T23:13:58Z", subject: "A Fellow Builder Who Took the Non-Traditional Path" },
  "natalie@ceomama.com": { status: "sent", sentAt: "2026-06-20T20:12:06Z", subject: "Building My Whole Business in Public Too" },
  "nuha@hellocozmo.ai": { status: "sent", sentAt: "2026-06-20T20:12:24Z", subject: "A Fellow Dubai-Raised Founder, Reaching Out" },
  "eve@alinea-invest.com": { status: "sent", sentAt: "2026-06-17T23:13:26Z", subject: "I Turned Down J.P. Morgan to Build, Like You" },
  "sukhinder.singh@xero.com": { status: "replied", sentAt: "2026-06-16T19:09:32Z", repliedAt: "2026-06-17T00:35:34Z", subject: "An Indian Founder Following the Path You Paved" },
  "anu@femalefoundersfund.com": { status: "sent", sentAt: "2026-06-17T23:13:11Z", subject: "An Indian Founder Following the Path You Paved" },
  "halima@oraan.com": { status: "replied", sentAt: "2026-06-22T19:49:51Z", repliedAt: "2026-06-23T05:29:16Z", subject: "A Fellow Founder Who Left Banking to Build" },
  "avni@joinmilo.com": { status: "sent", sentAt: "2026-06-22T19:50:06Z", subject: "An Indian Founder Building Vertical AI Too" },
  "tina@pacecapital.com": { status: "sent", sentAt: "2026-06-22T19:49:57Z", subject: "A Fellow Immigrant Writing and Building in AI" },
  // batch-3
  "aleena@edufi.tech": { status: "sent", sentAt: "2026-06-16T19:11:02Z", subject: "I Left Finance to Build, Like You Did" },
  "nandini@joinsitch.com": { status: "sent", sentAt: "2026-06-16T19:11:14Z", subject: "A Fellow Indian Founder Who Moved Here to Build" },
  "mahima@cocoon.com": { status: "sent", sentAt: "2026-06-17T23:13:06Z", subject: "An Indian Founder Following the Path You Paved" },
  "aileen@cowboy.vc": { status: "sent", sentAt: "2026-06-20T18:09:09Z", subject: "An Immigrant Founder Following the Path You Paved" },
  // daily
  "sandhya@unusual.vc": { status: "sent", sentAt: "2026-06-16T16:41:51Z", subject: "An Indian Immigrant Builder, Following Your Path" },
  "purva@lily.ai": { status: "sent", sentAt: "2026-06-16T16:41:29Z", subject: "An Indian Founder Who Navigated Visas While Building" },
  "chandini@auquan.com": { status: "sent", sentAt: "2026-06-16T16:41:15Z", subject: "A Fellow Finance-Leaver Building Vertical AI" },
  "rawan@zestequity.com": { status: "sent", sentAt: "2026-06-16T16:41:00Z", subject: "A Dubai Founder Who Left Finance to Build" },
  "yhenna@sympl.ai": { status: "sent", sentAt: "2026-06-16T16:40:51Z", subject: "A Fellow MENA Founder Who Left Finance to Build" },
  "eman@gathern.co": { status: "sent", sentAt: "2026-06-16T16:40:40Z", subject: "A Fellow Gulf Founder, Reaching Out" },
  "salma@siffletdata.com": { status: "sent", sentAt: "2026-06-16T16:40:16Z", subject: "A Fellow Finance-Leaver Who Went and Built" },
  "theresia@acrewcapital.com": { status: "sent", sentAt: "2026-06-16T16:40:06Z", subject: "An Immigrant Founder Following the Path You Paved" },
  "anita@vellum.ai": { status: "sent", sentAt: "2026-06-16T16:39:52Z", subject: "A Fellow Immigrant Builder Who Posts in Public, Reaching Out" },
  "doaa@chefaa.com": { status: "sent", sentAt: "2026-06-16T16:39:35Z", subject: "A Fellow MENA Founder Who Went Deep on a Hard Vertical" },
  "maya@spicecap.xyz": { status: "sent", sentAt: "2026-06-16T16:39:05Z", subject: "A Young Finance-Leaver Who Launched a Fund" },
  "deboshree.dutta@salesforce.com": { status: "sent", sentAt: "2026-06-16T19:10:51Z", subject: "A Fellow Indian Builder Who Posts in Public Too" },
  "pranjali@slashy.ai": { status: "sent", sentAt: "2026-06-16T19:10:33Z", subject: "A Fellow Immigrant Who Builds and Posts in Public" },
  "soniag@venturesouq.com": { status: "sent", sentAt: "2026-06-16T16:38:40Z", subject: "A Fellow Indian Who Built a Career in Gulf VC" },
  "dawoon@coffeemeetsbagel.com": { status: "sent", sentAt: "2026-06-16T16:37:45Z", subject: "A Fellow Finance-Leaver Who Left JPMorgan to Build" },
  "neha@oscilar.com": { status: "sent", sentAt: "2026-06-16T16:37:14Z", subject: "An Indian Immigrant Who Built to IPO Scale" },
};

function firstName(name: string): string {
  return name.split(" ")[0];
}

function generateBody(name: string, company: string, overlap: string): string {
  const fn = firstName(name);
  return `<p>Hi ${fn},</p><p>${overlap}. That is the exact path I keep coming back to as I build.</p><p>I'm Mehek, 20, a USC computer science student building an AI company solo and documenting it publicly at @mehek.builds. I'd love to grab fifteen minutes with you to hear what you'd tell a founder at my exact stage that most people overlook.</p><p>Thank you,<br>Mehek</p>`;
}

// Parse the dossier markdown table — only rows 51–227
function parseDossier(): Array<{ rowNum: number; name: string; company: string; email: string; batch: string; added: string }> {
  const text = fs.readFileSync(DOSSIER_PATH, "utf-8");
  const lines = text.split("\n");
  const results: Array<{ rowNum: number; name: string; company: string; email: string; batch: string; added: string }> = [];

  for (const line of lines) {
    // Match table rows like: | 51 | Name | Company | email@x.com | ... | batch | date |
    const m = line.match(/^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|[^|]+\|[^|]+\|\s*([^|]+)\|\s*([^|]+)\|/);
    if (!m) continue;
    const rowNum = parseInt(m[1], 10);
    if (rowNum < 51 || rowNum > 227) continue;
    results.push({
      rowNum,
      name: m[2].trim(),
      company: m[3].trim(),
      email: m[4].trim(),
      batch: m[5].trim(),
      added: m[6].trim(),
    });
  }
  return results;
}

function categoryFromCompany(company: string): string {
  const c = company.toLowerCase();
  if (c.includes(".vc") || c.includes("ventures") || c.includes("capital") || c.includes("fund") || c.includes("accel") || c.includes("sequoia") || c.includes("a16z") || c.includes("bessemer") || c.includes("cowboy") || c.includes("pear") || c.includes("speedinvest") || c.includes("conviction") || c.includes("ganas") || c.includes("andav") || c.includes("rukam") || c.includes("leap")) return "Female VC";
  if (c.includes("yc") || c.includes("y combinator")) return "YC founder";
  if (c.includes("dubai") || c.includes("mena") || c.includes("gulf") || c.includes("gathern") || c.includes("oraan") || c.includes("sympl") || c.includes("ziina") || c.includes("sav") || c.includes("khazna") || c.includes("sarwa") || c.includes("coinmena") || c.includes("caspa") || c.includes("almouneer")) return "Gulf founder";
  if (c.includes("creator") || c.includes("newsletter") || c.includes("media") || c.includes("podcast") || c.includes("rundown") || c.includes("workweek") || c.includes("substack")) return "Creator founder";
  return "Immigrant founder";
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  // Get existing emails to avoid duplicates
  const existing = await sql`SELECT email FROM mentor`;
  const existingEmails = new Set(existing.map((r: any) => r.email));

  const mentors = parseDossier();
  console.log(`Found ${mentors.length} mentor rows in dossier (51-227)`);

  let inserted = 0;
  let skipped = 0;

  for (const m of mentors) {
    if (existingEmails.has(m.email)) {
      skipped++;
      continue;
    }

    const sentInfo = SENT_MAP[m.email];
    const status = sentInfo?.status ?? "draft";
    const subject = sentInfo?.subject ?? `Reaching Out — ${firstName(m.name)} at ${m.company}`;
    const body = generateBody(m.name, m.company, m.company + " — " + m.batch);
    const waveDay = m.batch.startsWith("batch-2") ? 10 : m.batch.startsWith("batch-3") ? 12 : 15;

    await sql`
      INSERT INTO mentor (name, email, category, overlap, wave_day, subject, body, send_status, sent_at, replied_at, created_at)
      VALUES (
        ${m.name},
        ${m.email},
        ${categoryFromCompany(m.company)},
        ${m.company},
        ${waveDay},
        ${subject},
        ${body},
        ${status},
        ${sentInfo?.sentAt ? sentInfo.sentAt : null}::timestamptz,
        ${sentInfo?.repliedAt ? sentInfo.repliedAt : null}::timestamptz,
        NOW()
      )
    `;
    console.log(`  [${status.toUpperCase()}] ${m.name} (${m.email})`);
    inserted++;
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped (duplicate): ${skipped}`);

  const summary = await sql`SELECT send_status, COUNT(*) as count FROM mentor GROUP BY send_status ORDER BY send_status`;
  console.log("\nDB status breakdown:");
  for (const row of summary) {
    console.log(`  ${row.send_status}: ${row.count}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
