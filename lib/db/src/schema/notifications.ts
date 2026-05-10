import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const notificationTypeEnum = pgEnum("notification_type", [
  "new_application",
  "conversion_milestone",
  "system",
]);

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: notificationTypeEnum("type").notNull().default("new_application"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  affiliateId: integer("affiliate_id"),
  affiliateName: text("affiliate_name"),
  affiliateWhatsapp: text("affiliate_whatsapp"),
  affiliateEmail: text("affiliate_email"),
  whatsappMessage: text("whatsapp_message"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Notification = typeof notificationsTable.$inferSelect;
