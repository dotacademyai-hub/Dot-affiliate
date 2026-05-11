import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq, desc, sql } from "drizzle-orm";
import { db, affiliatesTable, clicksTable } from "@workspace/db";
import {
  UpdateAffiliateSettingsBody,
  ChangePasswordBody,
} from "@workspace/api-zod";
import { requireAffiliate } from "../middlewares/auth";

const router: IRouter = Router();

function safeAffiliate(a: typeof affiliatesTable.$inferSelect) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = a;
  return rest;
}

function getAffiliateLink(code: string): string {
  const domain = process.env.PUBLIC_DOMAIN ?? "localhost:80";
  return `https://${domain}/api/track/${code}`;
}

router.get("/affiliate/me", requireAffiliate, async (req, res): Promise<void> => {
  const affiliateId = (req as typeof req & { affiliateId: number }).affiliateId;

  const [affiliate] = await db
    .select()
    .from(affiliatesTable)
    .where(eq(affiliatesTable.id, affiliateId))
    .limit(1);

  if (!affiliate) {
    res.status(404).json({ error: "Affiliate not found" });
    return;
  }

  const ranked = await db
    .select({ id: affiliatesTable.id })
    .from(affiliatesTable)
    .where(eq(affiliatesTable.status, "active"))
    .orderBy(desc(affiliatesTable.conversions));

  const rankIndex = ranked.findIndex((r) => r.id === affiliateId);
  const rank = rankIndex >= 0 ? rankIndex + 1 : null;

  res.json({
    affiliate: safeAffiliate(affiliate),
    stats: {
      clicks: affiliate.clicks,
      conversions: affiliate.conversions,
      rank,
      affiliateLink: getAffiliateLink(affiliate.affiliateCode),
    },
  });
});

router.put("/affiliate/settings", requireAffiliate, async (req, res): Promise<void> => {
  const affiliateId = (req as typeof req & { affiliateId: number }).affiliateId;
  const parsed = UpdateAffiliateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name != null) updateData.name = parsed.data.name;
  if (parsed.data.username != null) updateData.username = parsed.data.username;
  if (parsed.data.whatsappNumber != null) updateData.whatsappNumber = parsed.data.whatsappNumber;
  if (parsed.data.phoneNumber !== undefined) updateData.phoneNumber = parsed.data.phoneNumber;
  if (parsed.data.primaryPlatform != null) updateData.primaryPlatform = parsed.data.primaryPlatform;

  // Check if username is taken if it's being changed
  if (parsed.data.username != null) {
    const [existing] = await db
      .select()
      .from(affiliatesTable)
      .where(eq(affiliatesTable.username, parsed.data.username))
      .limit(1);
    
    if (existing && existing.id !== affiliateId) {
      res.status(409).json({ error: "Username is already taken" });
      return;
    }
  }

  const [updated] = await db
    .update(affiliatesTable)
    .set(updateData)
    .where(eq(affiliatesTable.id, affiliateId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Affiliate not found" });
    return;
  }

  res.json(safeAffiliate(updated));
});

router.put("/affiliate/password", requireAffiliate, async (req, res): Promise<void> => {
  const affiliateId = (req as typeof req & { affiliateId: number }).affiliateId;
  const parsed = ChangePasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [affiliate] = await db
    .select()
    .from(affiliatesTable)
    .where(eq(affiliatesTable.id, affiliateId))
    .limit(1);

  if (!affiliate) {
    res.status(404).json({ error: "Affiliate not found" });
    return;
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, affiliate.passwordHash);
  if (!valid) {
    res.status(400).json({ error: "Current password is incorrect" });
    return;
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db
    .update(affiliatesTable)
    .set({ passwordHash: newHash })
    .where(eq(affiliatesTable.id, affiliateId));

  res.json({ success: true, message: "Password changed successfully" });
});

export { getAffiliateLink };
export default router;
