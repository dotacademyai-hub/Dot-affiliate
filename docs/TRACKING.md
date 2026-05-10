# DOT Affiliates — Tracking Mechanisms

## How Conversions Work

The platform uses **paid-referral-only tracking**. Only confirmed purchases increment an affiliate's `conversions` count. Clicks are tracked separately and do NOT affect leaderboard ranking.

```
Affiliate shares link → Visitor clicks → Visitor purchases → conversion event fires → affiliate rank updates
```

---

## Tracking Link Format

Every approved affiliate gets a unique code (e.g. `CHIDI3X7K2`).

Their tracking link should be:

```
https://your-ticketing-platform.com/buy?ref=CHIDI3X7K2
```

When this page loads, capture the `ref` query parameter and hold it through the checkout flow.

---

## Mechanism 1 — Direct API Call (Recommended)

The simplest and most reliable approach. Your ticketing/payment platform calls the DOT API directly after a successful payment.

### Step 1 — On page load, record a click

```js
// When visitor lands on your event page with ?ref=CODE
const ref = new URLSearchParams(window.location.search).get("ref");
if (ref) {
  fetch("https://your-dot-domain.com/api/public/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: ref, type: "click" }),
  });
  sessionStorage.setItem("dotRef", ref); // Persist through checkout
}
```

### Step 2 — On confirmed purchase, record a conversion

```js
// In your payment success handler / webhook handler
const ref = sessionStorage.getItem("dotRef");
if (ref) {
  await fetch("https://your-dot-domain.com/api/public/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: ref, type: "conversion" }),
  });
  sessionStorage.removeItem("dotRef");
}
```

### Server-side (most reliable — prevents client-side spoofing)

Fire from your payment webhook handler, not the browser:

```ts
// Node.js example — called from your payment webhook
async function onPaymentSucceeded(paymentIntent) {
  const ref = paymentIntent.metadata?.dotRef; // store ref in metadata at checkout
  if (!ref) return;

  await fetch("https://your-dot-domain.com/api/public/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: ref, type: "conversion" }),
  });
}
```

---

## Mechanism 2 — Tracking Pixel (Fire-and-Forget)

For platforms where you can only inject a pixel/script on the confirmation page.

```html
<!-- Place on your payment success / order confirmation page -->
<!-- Replace REF_CODE with the actual affiliate code from your session -->
<img
  src="https://your-dot-domain.com/api/public/track?code=REF_CODE&type=conversion"
  width="1"
  height="1"
  style="display:none;"
  alt=""
/>
```

> ⚠️ Pixel tracking is less reliable (ad blockers, browser privacy settings). Use the direct API call from your server when possible.

To support GET-based pixel tracking, add this endpoint to your API server:

```ts
// In artifacts/api-server/src/routes/public.ts
router.get("/public/track", async (req, res) => {
  const { code, type } = req.query;
  if (code && type) {
    // same logic as POST /track
    await handleTrackEvent(String(code), String(type));
  }
  // Return a 1x1 transparent GIF
  const gif = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
  res.set("Content-Type", "image/gif").send(gif);
});
```

---

## Mechanism 3 — Postback URL / S2S (Server-to-Server)

For platforms that support postback URLs (e.g. Paystack, Flutterwave webhooks, Selar, etc.).

Configure your payment processor to POST to:

```
POST https://your-dot-domain.com/api/public/track
Content-Type: application/json

{ "code": "{{ref_code}}", "type": "conversion" }
```

Most platforms let you include custom metadata/query params. Store the `ref` code when creating the payment, then pass it through in the webhook.

---

## Mechanism 4 — Cookie-Based Attribution (30-day window)

For longer attribution windows where you want to credit the last affiliate who referred the buyer.

```js
// On link click
function captureRef() {
  const ref = new URLSearchParams(window.location.search).get("ref");
  if (ref) {
    // Store in cookie with 30-day expiry
    document.cookie = `dotRef=${ref}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
    // Also fire click event
    fetch("/api/public/track", {
      method: "POST",
      body: JSON.stringify({ code: ref, type: "click" }),
      headers: { "Content-Type": "application/json" },
    });
  }
}

// On purchase confirmation — read cookie
function getStoredRef() {
  return document.cookie.split("; ").find(r => r.startsWith("dotRef="))?.split("=")[1] ?? null;
}
```

---

## Preventing Duplicate Conversions

To prevent the same purchase from being counted twice (e.g. if the success page reloads):

### Option A — Idempotency key

Pass a unique `orderId` or `transactionId` with each conversion call. Store processed IDs in the database and reject duplicates.

Add to the `clicks` table:
```sql
ALTER TABLE clicks ADD COLUMN transaction_id TEXT UNIQUE;
```

Then in the track handler:
```ts
// Check if transaction already tracked
const existing = await db.query.clicks.findFirst({
  where: eq(clicks.transactionId, transactionId),
});
if (existing) return res.status(200).json({ message: "already tracked" });
```

### Option B — sessionStorage flag (client-side)

```js
if (!sessionStorage.getItem("conversionFired")) {
  await fireConversion();
  sessionStorage.setItem("conversionFired", "1");
}
```

---

## Integrating with Popular Nigerian Payment Platforms

### Paystack

```ts
// Paystack webhook handler
app.post("/webhooks/paystack", express.raw({ type: "application/json" }), async (req, res) => {
  const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(req.body).digest("hex");
  if (hash !== req.headers["x-paystack-signature"]) return res.status(400).end();

  const event = JSON.parse(req.body);
  if (event.event === "charge.success") {
    const ref = event.data.metadata?.dot_ref;
    if (ref) {
      await fetch("https://your-dot-domain.com/api/public/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: ref, type: "conversion" }),
      });
    }
  }
  res.status(200).end();
});
```

Pass the ref when initializing Paystack:
```js
PaystackPop.setup({
  // ...
  metadata: { dot_ref: sessionStorage.getItem("dotRef") },
});
```

### Flutterwave

Similar pattern — include `meta: { dot_ref: ref }` in the payment config and read it from the webhook payload.

### Selar / Gumroad / External Platforms

Use a redirect/postback URL that your platform fires after payment:

```
https://your-dot-domain.com/api/public/track?code=REF_CODE&type=conversion
```

(Requires adding GET support to the tracking endpoint as shown in Mechanism 2.)

---

## Analytics & Fraud Prevention

### Red flags to watch for

- Conversion rate > 80% (suspicious — normal is 5-20%)
- Same IP generating multiple conversions within seconds
- Affiliates with 0 clicks but many conversions (API abuse)

### Recommended additions

1. **Rate limiting** on `/api/public/track` — max 10 requests/minute per IP
2. **IP logging** — already supported in the `clicks` table
3. **Minimum conversion delay** — require at least 30s between click and conversion from same IP
4. **Manual review threshold** — flag any affiliate with >50 conversions for admin review

### Adding rate limiting

```bash
pnpm --filter @workspace/api-server add express-rate-limit
```

```ts
import rateLimit from "express-rate-limit";

const trackLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: "Too many requests" },
});

router.post("/public/track", trackLimiter, trackHandler);
```

---

## Testing Tracking

Use the built-in demo platform at `/demo?ref=YOURCODE` to test the full flow:

1. Register as an affiliate and get approved (admin panel)
2. Copy your affiliate code from the dashboard
3. Visit `/demo?ref=YOURCODE`
4. Click "Buy Now" → complete the mock checkout
5. Observe the tracking API call in the success screen
6. Check your dashboard — conversions should increment
