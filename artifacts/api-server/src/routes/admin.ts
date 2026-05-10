import { Router, type IRouter } from "express";
import { eq, desc, like, or, and, sql, count } from "drizzle-orm";
import { db, affiliatesTable, activityTable, notificationsTable } from "@workspace/db";
import {
  AdminListAffiliatesQueryParams,
  AdminGetAffiliateParams,
  AdminDeleteAffiliateParams,
  AdminSuspendAffiliateParams,
  AdminUnsuspendAffiliateParams,
  AdminApproveAffiliateParams,
  AdminLoginBody,
} from "@workspace/api-zod";
import { requireAdmin, signAdminToken } from "../middlewares/auth";

const router: IRouter = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "fearless2025admin";
const APP_URL = process.env.APP_URL ?? "https://fearlessweek.com";

function safeAffiliate(a: typeof affiliatesTable.$inferSelect) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = a;
  return rest;
}

function buildApprovalWhatsApp(name: string, code: string, whatsapp: string): string {
  const link = `${APP_URL}?ref=${code}`;
  const msg = `🎉 *Congratulations ${name}!*\n\nYour DOT FEARLESS WEEK 2.0 affiliate application has been *approved*!\n\n🔗 *Your unique tracking link:*\n${link}\n\n📊 Log in to your dashboard to track your clicks and conversions:\n${APP_URL}/auth\n\nShare your link everywhere — only confirmed purchases count toward your rank and rewards. Let's go! 🚀\n\n— The DOT Team`;
  const number = whatsapp.replace(/[^0-9]/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

function buildSuspensionWhatsApp(name: string, whatsapp: string): string {
  const msg = `⚠️ *Hi ${name},*\n\nWe're reaching out regarding your DOT FEARLESS WEEK 2.0 affiliate account. Your account has been temporarily *suspended*.\n\nIf you believe this is a mistake or would like more information, please reply to this message and our team will assist you.\n\n— The DOT Team`;
  const number = whatsapp.replace(/[^0-9]/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

function buildReactivationWhatsApp(name: string, code: string, whatsapp: string): string {
  const link = `${APP_URL}?ref=${code}`;
  const msg = `✅ *Hi ${name}!*\n\nGreat news — your DOT FEARLESS WEEK 2.0 affiliate account has been *reactivated*!\n\n🔗 *Your tracking link:*\n${link}\n\nLog back in and keep driving referrals: ${APP_URL}/auth\n\n— The DOT Team`;
  const number = whatsapp.replace(/[^0-9]/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

/* ─── Admin Login ────────────────────────────────────────────── */

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (
    parsed.data.username !== ADMIN_USERNAME ||
    parsed.data.password !== ADMIN_PASSWORD
  ) {
    res.status(401).json({ error: "Invalid admin credentials" });
    return;
  }

  const token = signAdminToken({ role: "admin", username: parsed.data.username });
  res.json({ token, role: "admin" });
});

/* ─── Stats ──────────────────────────────────────────────────── */

router.get("/admin/stats", requireAdmin, async (_req, res): Promise<void> => {
  const [totals] = await db.select({ total: count() }).from(affiliatesTable);
  const [active] = await db.select({ cnt: count() }).from(affiliatesTable).where(eq(affiliatesTable.status, "active"));
  const [pending] = await db.select({ cnt: count() }).from(affiliatesTable).where(eq(affiliatesTable.status, "pending"));
  const [suspended] = await db.select({ cnt: count() }).from(affiliatesTable).where(eq(affiliatesTable.status, "suspended"));
  const [clicks] = await db.select({ total: sql<number>`COALESCE(SUM(${affiliatesTable.clicks}), 0)` }).from(affiliatesTable);
  const [conversions] = await db.select({ total: sql<number>`COALESCE(SUM(${affiliatesTable.conversions}), 0)` }).from(affiliatesTable);

  const totalClicks = Number(clicks?.total ?? 0);
  const totalConversions = Number(conversions?.total ?? 0);
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  res.json({
    totalAffiliates: Number(totals?.total ?? 0),
    activeAffiliates: Number(active?.cnt ?? 0),
    pendingAffiliates: Number(pending?.cnt ?? 0),
    suspendedAffiliates: Number(suspended?.cnt ?? 0),
    totalClicks,
    totalConversions,
    conversionRate: Math.round(conversionRate * 100) / 100,
  });
});

/* ─── Affiliates List ────────────────────────────────────────── */

router.get("/admin/affiliates", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminListAffiliatesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { status, search, page = 1, limit = 20 } = parsed.data;
  const offset = (page - 1) * limit;

  const ranked = await db
    .select()
    .from(affiliatesTable)
    .where(eq(affiliatesTable.status, "active"))
    .orderBy(desc(affiliatesTable.conversions));

  const rankMap = new Map<number, number>();
  ranked.forEach((a, i) => rankMap.set(a.id, i + 1));

  const conditions = [];
  if (status) conditions.push(eq(affiliatesTable.status, status as "pending" | "active" | "suspended"));
  if (search) conditions.push(or(like(affiliatesTable.name, `%${search}%`), like(affiliatesTable.email, `%${search}%`)));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ total }] = await db.select({ total: count() }).from(affiliatesTable).where(whereClause);

  const affiliates = await db
    .select()
    .from(affiliatesTable)
    .where(whereClause)
    .orderBy(desc(affiliatesTable.createdAt))
    .limit(limit)
    .offset(offset);

  const data = affiliates.map((a) => ({
    ...safeAffiliate(a),
    rank: rankMap.get(a.id) ?? null,
  }));

  res.json({ data, total: Number(total), page, limit });
});

/* ─── Single Affiliate ───────────────────────────────────────── */

router.get("/admin/affiliates/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AdminGetAffiliateParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const ranked = await db.select({ id: affiliatesTable.id }).from(affiliatesTable).where(eq(affiliatesTable.status, "active")).orderBy(desc(affiliatesTable.conversions));
  const rankMap = new Map<number, number>();
  ranked.forEach((a, i) => rankMap.set(a.id, i + 1));

  const [affiliate] = await db.select().from(affiliatesTable).where(eq(affiliatesTable.id, params.data.id)).limit(1);
  if (!affiliate) { res.status(404).json({ error: "Affiliate not found" }); return; }

  res.json({ ...safeAffiliate(affiliate), rank: rankMap.get(affiliate.id) ?? null });
});

/* ─── Delete ─────────────────────────────────────────────────── */

router.delete("/admin/affiliates/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AdminDeleteAffiliateParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db.delete(affiliatesTable).where(eq(affiliatesTable.id, params.data.id)).returning();
  if (!deleted) { res.status(404).json({ error: "Affiliate not found" }); return; }

  await db.insert(activityTable).values({
    type: "account_deleted",
    description: `Affiliate account deleted`,
    affiliateId: null,
    affiliateName: deleted.name,
  });

  res.json({ success: true, message: "Affiliate deleted" });
});

/* ─── Suspend ────────────────────────────────────────────────── */

router.post("/admin/affiliates/:id/suspend", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AdminSuspendAffiliateParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [updated] = await db.update(affiliatesTable).set({ status: "suspended" }).where(eq(affiliatesTable.id, params.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Affiliate not found" }); return; }

  const waLink = updated.whatsappNumber ? buildSuspensionWhatsApp(updated.name, updated.whatsappNumber) : null;

  await Promise.all([
    db.insert(activityTable).values({
      type: "account_suspended",
      description: `Affiliate account suspended`,
      affiliateId: updated.id,
      affiliateName: updated.name,
    }),
    db.insert(notificationsTable).values({
      type: "system",
      title: `Account suspended: ${updated.name}`,
      message: `You suspended ${updated.name} (${updated.email}). Click the WhatsApp button to notify them.`,
      affiliateId: updated.id,
      affiliateName: updated.name,
      affiliateWhatsapp: updated.whatsappNumber,
      affiliateEmail: updated.email,
      whatsappMessage: waLink,
      isRead: false,
    }),
  ]);

  res.json({ success: true, message: "Affiliate suspended" });
});

/* ─── Unsuspend ──────────────────────────────────────────────── */

router.post("/admin/affiliates/:id/unsuspend", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AdminUnsuspendAffiliateParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [updated] = await db.update(affiliatesTable).set({ status: "active" }).where(eq(affiliatesTable.id, params.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Affiliate not found" }); return; }

  const waLink = updated.whatsappNumber ? buildReactivationWhatsApp(updated.name, updated.affiliateCode, updated.whatsappNumber) : null;

  await Promise.all([
    db.insert(activityTable).values({
      type: "account_unsuspended",
      description: `Affiliate account reactivated`,
      affiliateId: updated.id,
      affiliateName: updated.name,
    }),
    db.insert(notificationsTable).values({
      type: "system",
      title: `Account reactivated: ${updated.name}`,
      message: `You reactivated ${updated.name} (${updated.email}). Send them a WhatsApp message to let them know.`,
      affiliateId: updated.id,
      affiliateName: updated.name,
      affiliateWhatsapp: updated.whatsappNumber,
      affiliateEmail: updated.email,
      whatsappMessage: waLink,
      isRead: false,
    }),
  ]);

  res.json({ success: true, message: "Affiliate unsuspended" });
});

/* ─── Approve ────────────────────────────────────────────────── */

router.post("/admin/affiliates/:id/approve", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AdminApproveAffiliateParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [updated] = await db.update(affiliatesTable).set({ status: "active" }).where(eq(affiliatesTable.id, params.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Affiliate not found" }); return; }

  const waLink = updated.whatsappNumber ? buildApprovalWhatsApp(updated.name, updated.affiliateCode, updated.whatsappNumber) : null;

  await Promise.all([
    db.insert(activityTable).values({
      type: "account_approved",
      description: `Affiliate approved and activated`,
      affiliateId: updated.id,
      affiliateName: updated.name,
    }),
    db.insert(notificationsTable).values({
      type: "system",
      title: `Approved: ${updated.name}`,
      message: `${updated.name} (${updated.email}) has been approved. Tap the WhatsApp button to send them their tracking link and congratulate them!`,
      affiliateId: updated.id,
      affiliateName: updated.name,
      affiliateWhatsapp: updated.whatsappNumber,
      affiliateEmail: updated.email,
      whatsappMessage: waLink,
      isRead: false,
    }),
  ]);

  res.json({ success: true, message: "Affiliate approved" });
});

/* ─── Top Performers ─────────────────────────────────────────── */

router.get("/admin/top-performers", requireAdmin, async (_req, res): Promise<void> => {
  const affiliates = await db
    .select()
    .from(affiliatesTable)
    .where(eq(affiliatesTable.status, "active"))
    .orderBy(desc(affiliatesTable.conversions))
    .limit(10);

  const data = affiliates.map((a, i) => ({ ...safeAffiliate(a), rank: i + 1 }));
  res.json(data);
});

/* ─── Activity ───────────────────────────────────────────────── */

router.get("/admin/activity", requireAdmin, async (_req, res): Promise<void> => {
  const activities = await db.select().from(activityTable).orderBy(desc(activityTable.createdAt)).limit(50);
  res.json(activities);
});

/* ─── Notifications ──────────────────────────────────────────── */

router.get("/admin/notifications", requireAdmin, async (_req, res): Promise<void> => {
  const notifications = await db
    .select()
    .from(notificationsTable)
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  res.json({ notifications, unreadCount });
});

router.post("/admin/notifications/read-all", requireAdmin, async (_req, res): Promise<void> => {
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.isRead, false));
  res.json({ success: true, message: "All notifications marked as read" });
});

router.post("/admin/notifications/:id/read", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, id));
  res.json({ success: true, message: "Notification marked as read" });
});

export default router;
