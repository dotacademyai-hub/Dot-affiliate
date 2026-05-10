import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const activityTable = pgTable("activity", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  affiliateId: integer("affiliate_id"),
  affiliateName: text("affiliate_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Activity = typeof activityTable.$inferSelect;
