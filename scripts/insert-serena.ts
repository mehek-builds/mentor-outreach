import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  await sql`
    INSERT INTO mentor (name, email, category, overlap, wave_day, subject, body, send_status)
    VALUES (
      'Serena Ge',
      'serena@datacurve.ai',
      'Young founder',
      'Immigrant dropout, female, build-in-public, YC W24 + raise',
      5,
      'A Fellow Young Founder Building in Public',
      '<p>Hi Serena,</p><p>You''re a step ahead on the exact path I''m walking, leaving to build and pivoting until it clicked, which is why I wanted to reach out to you specifically rather than someone three stages ahead who would feel out of reach.</p><p>I''m Mehek, a USC computer science student building a vertical-AI company on my own and shipping in public as I go.</p><p>The part I''d most love to learn is how you knew which pivot was the one worth committing to, because that''s the exact question I''m sitting with now. Could we find fifteen minutes this week? I''m at the start of this and genuinely ready to learn from how you did it.</p><p>Thank you, Serena.</p><p>Mehek</p>',
      'draft'
    )
  `;
  console.log("Serena Ge inserted.");
}

main().catch((e) => { console.error(e); process.exit(1); });
