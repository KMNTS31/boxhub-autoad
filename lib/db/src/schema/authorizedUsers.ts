import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const authorizedUsersTable = pgTable("authorized_users", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  username: text("username").notNull(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  authorizedAt: timestamp("authorized_at", { withTimezone: true }).notNull().defaultNow(),
  authorizedBy: text("authorized_by").notNull(),
  notes: text("notes"),
  tokenHash: text("token_hash"),
  lastSeen: timestamp("last_seen", { withTimezone: true }),
  sessionCount: integer("session_count").notNull().default(0),
});

export const insertAuthorizedUserSchema = createInsertSchema(authorizedUsersTable).omit({ id: true, authorizedAt: true });
export type InsertAuthorizedUser = z.infer<typeof insertAuthorizedUserSchema>;
export type AuthorizedUser = typeof authorizedUsersTable.$inferSelect;
