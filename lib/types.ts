export type SendStatus = "draft" | "approved" | "sent" | "replied" | "bounced";

export type Mentor = {
  id: number;
  name: string;
  email: string;
  category: string | null;
  overlap: string | null;
  waveDay: number | null;
  subject: string;
  body: string;
  sendStatus: SendStatus;
  sentAt: Date | null;
  gmailMessageId: string | null;
  gmailThreadId: string | null;
  repliedAt: Date | null;
  bouncedAt: Date | null;
  createdAt: Date | null;
};

export type FunnelMetrics = {
  total: number;
  sent: number;
  replied: number;
  bounced: number;
};
