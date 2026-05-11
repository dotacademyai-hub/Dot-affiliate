import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, affiliatesTable, activityTable, notificationsTable } from "@workspace/db";
import {
  RegisterAffiliateBody,
  LoginAffiliateBody,
} from "@workspace/api-zod";
import {
  signAffiliateToken,
  requireAffiliate,
  signAdminToken,
} from "../middlewares/auth";
import { generateAffiliateCode } from "../lib/affiliateCode";
import { sendEmail, notifyAdmins } from "../lib/email";

const router: IRouter = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "fearless2025admin";

function safeAffiliate(a: typeof affiliatesTable.$inferSelect) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = a;
  return rest;
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterAffiliateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { password, ...rest } = parsed.data;

  const existing = await db
    .select()
    .from(affiliatesTable)
    .where(eq(affiliatesTable.email, rest.email))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "An account with this email already exists. Please login instead." });
    return;
  }

  const existingUsername = await db
    .select()
    .from(affiliatesTable)
    .where(eq(affiliatesTable.username, rest.username))
    .limit(1);

  if (existingUsername.length > 0) {
    res.status(409).json({ error: "This username is already taken. Please choose another one." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const affiliateCode = generateAffiliateCode();

  const [affiliate] = await db
    .insert(affiliatesTable)
    .values({
      ...rest,
      passwordHash,
      affiliateCode,
      status: "pending",
    })
    .returning();

  const waReviewLink = affiliate.whatsappNumber
    ? (() => {
        const number = affiliate.whatsappNumber.replace(/[^0-9]/g, "");
        const msg = `👋 Hi ${affiliate.name}, we've received your FEARLESS WEEK 2.0 affiliate application! Our team will review it shortly and get back to you. Stay tuned! — The DOT Team`;
        return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
      })()
    : null;

  // Send Email Notifications
  await Promise.all([
    // Notify Affiliate
    sendEmail({
      to: affiliate.email,
      subject: "Application Received - DOT FEARLESS WEEK 2.0",
      text: `Hi ${affiliate.name},\n\nWe've received your FEARLESS WEEK 2.0 affiliate application! Our team will review it shortly and get back to you.\n\nStay tuned!\n\n— The DOT Team`,
    }),
    // Notify Admin
    notifyAdmins(
      `New Application: ${affiliate.name}`,
      `A new affiliate application has been submitted.\n\nName: ${affiliate.name}\nEmail: ${affiliate.email}\nPlatform: ${affiliate.primaryPlatform}\n\nReview it here: ${process.env.APP_URL}/fearless-control-gate-2025`
    ),
  ]);

  await Promise.all([
    db.insert(activityTable).values({
      type: "registration",
      description: `New affiliate application submitted`,
      affiliateId: affiliate.id,
      affiliateName: affiliate.name,
    }),
    db.insert(notificationsTable).values({
      type: "new_application",
      title: `New application: ${affiliate.name}`,
      message: `${affiliate.name} (${affiliate.email}) just applied to become an affiliate. Review their profile and approve or reject their application.`,
      affiliateId: affiliate.id,
      affiliateName: affiliate.name,
      affiliateWhatsapp: affiliate.whatsappNumber,
      affiliateEmail: affiliate.email,
      whatsappMessage: waReviewLink,
      isRead: false,
    }),
  ]);

  const token = signAffiliateToken({ affiliateId: affiliate.id, email: affiliate.email });
  res.status(201).json({ affiliate: safeAffiliate(affiliate), token });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginAffiliateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { identifier, password } = parsed.data;

  // 1. Check if it's the Admin
  if (identifier === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = signAdminToken({ role: "admin", username: identifier });
    res.json({ token, role: "admin" });
    return;
  }

  // 2. Check if it's an Affiliate
  const [affiliate] = await db
    .select()
    .from(affiliatesTable)
    .where(identifier.includes("@") 
      ? eq(affiliatesTable.email, identifier) 
      : eq(affiliatesTable.username, identifier)
    )
    .limit(1);

  if (!affiliate) {
    res.status(401).json({ error: "No login credentials found for this user" });
    return;
  }

  const valid = await bcrypt.compare(password, affiliate.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid password. Please try again." });
    return;
  }

  if (affiliate.status === "suspended") {
    res.status(403).json({ error: "Your account has been suspended. Contact support." });
    return;
  }

  const token = signAffiliateToken({ affiliateId: affiliate.id, email: affiliate.email });
  res.json({ affiliate: safeAffiliate(affiliate), token, role: "affiliate" });
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ success: true, message: "Logged out" });
});

router.get("/auth/me", requireAffiliate, async (req, res): Promise<void> => {
  const affiliateId = (req as typeof req & { affiliateId: number }).affiliateId;

  const [affiliate] = await db
    .select()
    .from(affiliatesTable)
    .where(eq(affiliatesTable.id, affiliateId))
    .limit(1);

  if (!affiliate) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.json(safeAffiliate(affiliate));
});

export default router;
