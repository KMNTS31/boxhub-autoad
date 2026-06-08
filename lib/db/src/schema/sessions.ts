import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sessionsTable = pgTable("auto_ad_sessions", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull(),
  channelId: text("channel_id").notNull(),
  message: text("message").notNull(),
  delay: integer("delay").notNull().default(0),
  interval: integer("interval").notNull().default(60000),
  status: text("status").notNull().default("idle"),
  messagesSent: integer("messages_sent").notNull().default(0),
  userToken: text("user_token").notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastSentAt: timestamp("last_sent_at", { withTimezone: true }),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({ id: true, createdAt: true, messagesSent: true, status: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;
