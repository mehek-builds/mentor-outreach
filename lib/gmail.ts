import { google } from "googleapis";

function getAuth() {
  const auth = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
  );
  auth.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  return auth;
}

export function isGmailConfigured() {
  return !!(
    process.env.GMAIL_CLIENT_ID &&
    process.env.GMAIL_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN
  );
}

export async function sendEmail(to: string, subject: string, htmlBody: string) {
  const auth = getAuth();
  const gmail = google.gmail({ version: "v1", auth });

  const from = "Mehek Mandal <mehekmandal05@gmail.com>";
  const messageParts = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    htmlBody,
  ];
  const raw = Buffer.from(messageParts.join("\r\n")).toString("base64url");

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });

  return {
    messageId: res.data.id ?? null,
    threadId: res.data.threadId ?? null,
  };
}

export async function checkThreadForReply(threadId: string): Promise<boolean> {
  const auth = getAuth();
  const gmail = google.gmail({ version: "v1", auth });

  const thread = await gmail.users.threads.get({
    userId: "me",
    id: threadId,
    format: "minimal",
  });

  const messages = thread.data.messages ?? [];
  // More than 1 message in the thread means someone replied
  return messages.length > 1;
}

export async function findBounceForThread(
  threadId: string,
): Promise<boolean> {
  const auth = getAuth();
  const gmail = google.gmail({ version: "v1", auth });

  // Gmail puts bounce notifications in the same thread as the sent message
  const thread = await gmail.users.threads.get({
    userId: "me",
    id: threadId,
    format: "metadata",
    metadataHeaders: ["subject", "from"],
  });

  const messages = thread.data.messages ?? [];
  for (const msg of messages) {
    const headers = msg.payload?.headers ?? [];
    const from = headers.find((h) => h.name?.toLowerCase() === "from")?.value ?? "";
    const subject = headers.find((h) => h.name?.toLowerCase() === "subject")?.value ?? "";
    if (
      from.toLowerCase().includes("mailer-daemon") ||
      subject.toLowerCase().includes("delivery status notification") ||
      subject.toLowerCase().includes("undeliverable")
    ) {
      return true;
    }
  }
  return false;
}
