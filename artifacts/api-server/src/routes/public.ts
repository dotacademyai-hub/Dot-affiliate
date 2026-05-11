import { Router, type IRouter } from "express";
import { eq, desc, and, gt } from "drizzle-orm";
import { db, affiliatesTable, clicksTable, activityTable } from "@workspace/db";
import { TrackAffiliateClickParams } from "@workspace/api-zod";
import { nanoid } from "nanoid";

const router: IRouter = Router();

const SELLENDA_URL = "https://sellenda.com.ng/buy/3561B2";

router.get("/public/leaderboard", async (_req, res): Promise<void> => {
  const affiliates = await db
    .select({
      id: affiliatesTable.id,
      username: affiliatesTable.username,
      primaryPlatform: affiliatesTable.primaryPlatform,
      conversions: affiliatesTable.conversions,
      clicks: affiliatesTable.clicks,
    })
    .from(affiliatesTable)
    .where(and(eq(affiliatesTable.status, "active"), gt(affiliatesTable.conversions, 0)))
    .orderBy(desc(affiliatesTable.conversions))
    .limit(50);

  const leaderboard = affiliates.map((a: any, i: number) => ({
    rank: i + 1,
    username: a.username,
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

/* ─── Affiliate Redirector ───────────────────────────────────── */

router.get("/go/sellenda", async (req, res): Promise<void> => {
  const affCode = req.query.aff as string;
  if (!affCode) {
    res.status(400).send("Missing affiliate code");
    return;
  }

  // Verify affiliate exists and is active
  const [affiliate] = await db
    .select()
    .from(affiliatesTable)
    .where(and(eq(affiliatesTable.affiliateCode, affCode), eq(affiliatesTable.status, "active")))
    .limit(1);

  if (!affiliate) {
    res.status(404).send("Invalid or inactive affiliate");
    return;
  }

  // Generate a unique token for this tracking session
  const token = nanoid();

  // Record the click with the token
  await db.insert(clicksTable).values({
    affiliateId: affiliate.id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    token: token,
    isPaid: false,
  });

  // Check for unique click (same IP and User Agent in last 24 hours)
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  const [existingClick] = await db
    .select()
    .from(clicksTable)
    .where(
      and(
        eq(clicksTable.affiliateId, affiliate.id),
        eq(clicksTable.ipAddress, req.ip ?? ""),
        eq(clicksTable.userAgent, req.headers["user-agent"] ?? ""),
        gt(clicksTable.createdAt, twentyFourHoursAgo),
        eq(clicksTable.isPaid, false) // Only count unique non-paid clicks
      )
    )
    .limit(1);

  // If no previous click in last 24h, increment the count
  if (!existingClick) {
    await db
      .update(affiliatesTable)
      .set({ clicks: affiliate.clicks + 1 })
      .where(eq(affiliatesTable.id, affiliate.id));
  }

  // Set first-party cookie with the token
  // SameSite=Lax is crucial for survival across cross-site redirects
  res.cookie("aff_token", token, {
    maxAge: 86400000, // 24 hours
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    httpOnly: true, // Server-side read only for better security
  });

  // Redirect to the static Sellenda checkout page
  res.redirect(SELLENDA_URL);
});

/* ─── Cleaner Affiliate Redirector ───────────────────────────── */

router.get("/ref/:code", async (req, res): Promise<void> => {
  const { code } = req.params;
  if (!code) {
    res.status(400).send("Missing affiliate code");
    return;
  }

  // Reuse the existing logic by redirecting to the standard handler
  // This keeps the unique click logic and cookie setting in one place
  res.redirect(`/api/go/sellenda?aff=${code}`);
});

/* ─── Success / Conversion Page (Obfuscated) ─────────────────── */

router.get("/checkout/v1/payment-confirmed-3561B2", async (req, res): Promise<void> => {
  const token = req.cookies?.aff_token;
  let success = false;
  let errorMsg = "";

  if (token) {
    // Find the click record for this token
    const [click] = await db
      .select()
      .from(clicksTable)
      .where(and(eq(clicksTable.token, token), eq(clicksTable.isPaid, false)))
      .limit(1);

    if (click) {
      // Mark click as paid (converted)
      await db
        .update(clicksTable)
        .set({ isPaid: true })
        .where(eq(clicksTable.id, click.id));

      // Increment conversion count on affiliate profile
      const [affiliate] = await db
        .select()
        .from(affiliatesTable)
        .where(eq(affiliatesTable.id, click.affiliateId))
        .limit(1);

      if (affiliate) {
        await db
          .update(affiliatesTable)
          .set({ conversions: affiliate.conversions + 1 })
          .where(eq(affiliatesTable.id, affiliate.id));

        // Record activity log
        await db.insert(activityTable).values({
          type: "conversion",
          description: `Paid referral recorded via Sellenda`,
          affiliateId: affiliate.id,
          affiliateName: affiliate.name,
        });
        
        success = true;
      } else {
        errorMsg = "Affiliate not found for this transaction.";
      }

      // Clear the cookie so it's not reused
      res.clearCookie("aff_token");
    } else {
      errorMsg = "This transaction has already been processed or the tracking session is invalid.";
    }
  } else {
    errorMsg = "No tracking session found. If you have already completed your purchase, don't worry—your order is confirmed!";
  }

  // Serve the customizable Success/Error HTML
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${success ? "Payment Successful" : "Order Status"} - DOT</title>
      <style>
        :root {
          --primary: ${success ? "#22c55e" : "#ef4444"};
          --background: #09090b;
          --foreground: #ffffff;
          --muted: #71717a;
        }
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: var(--background);
          color: var(--foreground);
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
        }
        .container {
          padding: 2rem;
          max-width: 450px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1.5rem;
          background: rgba(255,255,255,0.02);
        }
        .icon {
          width: 64px;
          height: 64px;
          background: ${success ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"};
          color: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
        h1 {
          font-size: 2rem;
          font-weight: 900;
          margin-bottom: 1rem;
          letter-spacing: -0.025em;
        }
        p {
          color: var(--muted);
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        .btn {
          display: inline-block;
          background-color: var(--primary);
          color: ${success ? "#000" : "#fff"};
          font-weight: 700;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn:hover {
          transform: scale(1.05);
          filter: brightness(1.1);
        }
        .secondary-link {
          display: block;
          margin-top: 1.5rem;
          color: var(--muted);
          font-size: 0.875rem;
          text-decoration: none;
        }
        .secondary-link:hover {
          color: var(--foreground);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">
          ${success 
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
          }
        </div>
        <h1>${success ? "Payment Successful!" : "Status Update"}</h1>
        <p>${success 
          ? "Thank you for your purchase for FEARLESS WEEK 2.0. Your tickets have been confirmed and will be sent to your email shortly." 
          : errorMsg
        }</p>
        <a href="${SELLENDA_URL}" class="btn">Return to Store</a>
        <a href="/" class="secondary-link">Go to Home Page</a>
      </div>
      <script>
        // If inside an iframe, notify parent
        if (window.parent !== window) {
          window.parent.postMessage({ type: 'payment-conversion', success: ${success} }, '*');
        }
      </script>
    </body>
    </html>
  `);
});

export default router;
