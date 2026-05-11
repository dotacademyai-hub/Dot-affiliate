import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const affiliateStatusEnum = pgEnum("affiliate_status", [
  "pending",
  "active",
  "suspended",
]);

export const primaryPlatformEnum = pgEnum("primary_platform", [
  "instagram",
  "tiktok",
  "twitter",
  "snapchat",
  "whatsapp",
  "facebook",
]);

export const ticketEstimateEnum = pgEnum("ticket_estimate", [
  "0-50",
  "50-100",
  "100+",
]);

export const affiliatesTable = pgTable("affiliates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  whatsappNumber: text("whatsapp_number").notNull(),
  phoneNumber: text("phone_number"),
  affiliateCode: text("affiliate_code").notNull().unique(),
  status: affiliateStatusEnum("status").notNull().default("pending"),
  primaryPlatform: primaryPlatformEnum("primary_platform").notNull(),
  avgEngagement: text("avg_engagement").notNull(),
  hasPromotedBefore: boolean("has_promoted_before").notNull().default(false),
  whatsappGroupsReach: text("whatsapp_groups_reach").notNull(),
  ticketsSellEstimate: ticketEstimateEnum("tickets_sell_estimate").notNull(),
  estimatedReach: text("estimated_reach"),
  willingToPromote: boolean("willing_to_promote").notNull().default(true),
  whySelectYou: text("why_select_you").notNull(),
  clicks: integer("clicks").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertAffiliateSchema = createInsertSchema(affiliatesTable).omit({
  id: true,
  affiliateCode: true,
  clicks: true,
  conversions: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAffiliate = z.infer<typeof insertAffiliateSchema>;
export type Affiliate = typeof affiliatesTable.$inferSelect;
