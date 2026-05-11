import { pgTable, serial, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { affiliatesTable } from "./affiliates";

export const clicksTable = pgTable("clicks", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id")
    .notNull()
    .references(() => affiliatesTable.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  isPaid: boolean("is_paid").notNull().default(false),
  token: text("token"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Click = typeof clicksTable.$inferSelect;
