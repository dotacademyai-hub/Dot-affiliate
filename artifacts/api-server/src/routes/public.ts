import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, affiliatesTable, clicksTable, activityTable } from "@workspace/db";
import { TrackAffiliateClickParams } from "@workspace/api-zod";
import { getAffiliateLink } from "./affiliate";

const router: IRouter = Router();

router.get("/public/leaderboard", async (_req, res): Promise<void> => {
  const affiliates = await db
    .select({
      id: affiliatesTable.id,
      name: affiliatesTable.name,
      primaryPlatform: affiliatesTable.primaryPlatform,
      conversions: affiliatesTable.conversions,
      clicks: affiliatesTable.clicks,
    })
    .from(affiliatesTable)
    .where(eq(affiliatesTable.status, "active"))
    .orderBy(desc(affiliatesTable.conversions))
    .limit(50);

  const leaderboard = affiliates.map((a, i) => ({
    rank: i + 1,
    name: a.name,
    primaryPlatform: a.primaryPlatform,
    conversions: a.conversions,
    clicks: a.clicks,
  }));

  res.json(leaderboard);
});

router.get("/track/:code", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
  const params = TrackAffiliateClickParams.safeParse({ code: raw });
  if (!params.success) {
    res.status(400).json({ error: "Invalid code" });
    return;
  }

  const [affiliate] = await db
    .select()
    .from(affiliatesTable)
    .where(eq(affiliatesTable.affiliateCode, params.data.code))
    .limit(1);

  if (!affiliate) {
    res.status(404).json({ error: "Invalid affiliate code" });
    return;
  }

  if (affiliate.status !== "active") {
    res.status(404).json({ error: "Invalid affiliate code" });
    return;
  }

  await db.insert(clicksTable).values({
    affiliateId: affiliate.id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    isPaid: false,
  });

  await db
    .update(affiliatesTable)
    .set({ clicks: affiliate.clicks + 1 })
    .where(eq(affiliatesTable.id, affiliate.id));

  res.json({ success: true, message: "Click tracked" });
});

export default router;
