import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const mentors = pgTable("mentor", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  category: text("category"),
  overlap: text("overlap"),
  waveDay: integer("wave_day"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  sendStatus: text("send_status").notNull().default("draft"),
  sentAt: timestamp("sent_at"),
  gmailMessageId: text("gmail_message_id"),
  gmailThreadId: text("gmail_thread_id"),
  repliedAt: timestamp("replied_at"),
  bouncedAt: timestamp("bounced_at"),
  editedByUser: text("edited_by_user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sendEvents = pgTable("send_event", {
  id: serial("id").primaryKey(),
  mentorId: integer("mentor_id").references(() => mentors.id),
  eventType: text("event_type").notNull(),
  meta: text("meta"),
  createdAt: timestamp("created_at").defaultNow(),
});
