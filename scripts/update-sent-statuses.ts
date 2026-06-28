import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

// Emails already sent manually from mehekman@usc.edu, verified from Gmail
// Status: sent | replied | draft
const SENT_UPDATES: Array<{
  email: string;
  status: "sent" | "replied";
  sentAt: string;
  repliedAt?: string;
}> = [
  // Batch-1 contacts confirmed sent via Gmail
  { email: "wemimo@esusu.com", status: "replied", sentAt: "2026-06-16T19:10:16Z", repliedAt: "2026-06-16T21:01:50Z" },
  { email: "kavitta@nectir.io", status: "sent", sentAt: "2026-06-20T20:13:35Z" },
  { email: "sahil@sahilbloom.com", status: "replied", sentAt: "2026-06-20T20:13:30Z", repliedAt: "2026-06-22T19:50:01Z" },
  { email: "support@alliekmiller.com", status: "sent", sentAt: "2026-06-20T20:13:27Z" },
  { email: "ruchi@southparkcommons.com", status: "sent", sentAt: "2026-06-17T23:12:41Z" },
  { email: "charu@fenrock.ai", status: "sent", sentAt: "2026-06-20T20:13:14Z" },
  { email: "sonya@phinity.ai", status: "sent", sentAt: "2026-06-20T20:13:03Z" },
  { email: "founders@zeroentropy.dev", status: "sent", sentAt: "2026-06-20T20:13:01Z" },
  { email: "jaleh@mutinyhq.com", status: "sent", sentAt: "2026-06-16T19:09:55Z" },
  { email: "tina@lonelyoctopus.com", status: "sent", sentAt: "2026-06-20T20:12:57Z" },
  { email: "jenny@jennyhoyos.com", status: "sent", sentAt: "2026-06-20T20:12:50Z" },
  { email: "maggie@hotsmartrich.com", status: "sent", sentAt: "2026-06-20T20:13:09Z" },
  { email: "zach@calai.app", status: "sent", sentAt: "2026-06-20T20:12:34Z" },
  { email: "dickie@ship30for30.com", status: "sent", sentAt: "2026-06-20T20:12:37Z" },
  { email: "cole@ship30for30.com", status: "sent", sentAt: "2026-06-20T20:12:44Z" },
  { email: "marie@tally.so", status: "sent", sentAt: "2026-06-20T20:13:21Z" },
  { email: "hello@mariepoulin.com", status: "sent", sentAt: "2026-06-22T19:50:31Z" },
  { email: "cassey@blogilates.com", status: "sent", sentAt: "2026-06-20T20:13:17Z" },
  { email: "henrique@brex.com", status: "sent", sentAt: "2026-06-22T19:50:24Z" },
  { email: "jyoti@harness.io", status: "sent", sentAt: "2026-06-16T19:09:50Z" },
  { email: "deepica@livetinted.com", status: "sent", sentAt: "2026-06-22T19:49:46Z" },
  { email: "gergely@pragmaticengineer.com", status: "replied", sentAt: "2026-06-22T19:50:38Z", repliedAt: "2026-06-22T20:38:29Z" },
  { email: "anada@boldvoice.com", status: "sent", sentAt: "2026-06-22T19:50:17Z" },
  { email: "tracy@tigereye.com", status: "sent", sentAt: "2026-06-16T19:09:55Z" },
  { email: "may@writer.com", status: "sent", sentAt: "2026-06-16T19:09:44Z" },
  { email: "lenny@lennyrachitsky.com", status: "sent", sentAt: "2026-06-20T20:13:39Z" },
  { email: "devaki.raj@saabinc.com", status: "sent", sentAt: "2026-06-16T19:09:52Z" },
  { email: "divya@5sens.co", status: "sent", sentAt: "2026-06-17T23:12:38Z" },
  { email: "kat@miss-excel.com", status: "sent", sentAt: "2026-06-20T20:12:17Z" },
  { email: "polina@readtheprofile.com", status: "sent", sentAt: "2026-06-20T20:12:19Z" },
  { email: "rebecca@flodesk.com", status: "sent", sentAt: "2026-06-17T23:13:39Z" },
  { email: "ankita@strongher.vc", status: "sent", sentAt: "2026-06-17T23:12:33Z" },
  { email: "priyanka@casium.com", status: "replied", sentAt: "2026-06-17T23:13:39Z", repliedAt: "2026-06-20T17:57:38Z" },
  { email: "ssaria@cs.jhu.edu", status: "sent", sentAt: "2026-06-17T23:12:38Z" },
  { email: "breddy@abacus.ai", status: "sent", sentAt: "2026-06-16T19:09:36Z" },
  { email: "harshita@atob.com", status: "sent", sentAt: "2026-06-20T20:12:22Z" },
  { email: "eva@fika.vc", status: "sent", sentAt: "2026-06-17T23:12:28Z" },
  { email: "shruti@array.vc", status: "sent", sentAt: "2026-06-16T19:09:39Z" },
  { email: "sarah@cleocap.com", status: "sent", sentAt: "2026-06-16T19:09:27Z" },
  { email: "serena@datacurve.ai", status: "sent", sentAt: "2026-06-20T20:12:12Z" },
  { email: "gabriel@lobstercap.com", status: "sent", sentAt: "2026-06-17T23:14:05Z" },
  { email: "carina@axiommath.ai", status: "sent", sentAt: "2026-06-17T23:14:12Z" },
  { email: "mariama@aethexai.com", status: "sent", sentAt: "2026-06-20T20:12:03Z" },
  { email: "sophia.zhao@av.vc", status: "sent", sentAt: "2026-06-20T20:12:15Z" },
];

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  let updated = 0;
  for (const u of SENT_UPDATES) {
    const result = await sql`
      UPDATE mentor
      SET
        send_status = ${u.status},
        sent_at = ${u.sentAt}::timestamptz,
        replied_at = ${u.repliedAt ?? null}::timestamptz
      WHERE email = ${u.email}
        AND send_status = 'draft'
      RETURNING id, name
    `;
    if (result.length > 0) {
      console.log(`Updated: ${result[0].name} (${u.email}) -> ${u.status}`);
      updated++;
    } else {
      // Already updated or not found
    }
  }

  console.log(`\nDone. ${updated} mentors updated.`);

  // Show summary
  const summary = await sql`
    SELECT send_status, COUNT(*) as count
    FROM mentor
    GROUP BY send_status
    ORDER BY send_status
  `;
  console.log("\nCurrent status breakdown:");
  for (const row of summary) {
    console.log(`  ${row.send_status}: ${row.count}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
