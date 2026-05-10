import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, affiliatesTable, activityTable } from "@workspace/db";
import {
  RegisterAffiliateBody,
  LoginAffiliateBody,
} from "@workspace/api-zod";
import {
  signAffiliateToken,
  requireAffiliate,
} from "../middlewares/auth";
import { generateAffiliateCode } from "../lib/affiliateCode";

const router: IRouter = Router();

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
    res.status(409).json({ error: "An account with this email already exists" });
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

  await db.insert(activityTable).values({
    type: "registration",
    description: `New affiliate application submitted`,
    affiliateId: affiliate.id,
    affiliateName: affiliate.name,
  });

  const token = signAffiliateToken({ affiliateId: affiliate.id, email: affiliate.email });
  res.status(201).json({ affiliate: safeAffiliate(affiliate), token });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginAffiliateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [affiliate] = await db
    .select()
    .from(affiliatesTable)
    .where(eq(affiliatesTable.email, parsed.data.email))
    .limit(1);

  if (!affiliate) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(parsed.data.password, affiliate.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  if (affiliate.status === "suspended") {
    res.status(403).json({ error: "Your account has been suspended. Contact support." });
    return;
  }

  const token = signAffiliateToken({ affiliateId: affiliate.id, email: affiliate.email });
  res.json({ affiliate: safeAffiliate(affiliate), token });
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
