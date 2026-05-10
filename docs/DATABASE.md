# DOT Affiliates — Database Documentation

## Overview

The database is **PostgreSQL** managed via **Drizzle ORM**. The schema lives in `lib/db/src/schema/`. All migrations are handled with `drizzle-kit push` (no migration files — schema is pushed directly in development; use migration files in production).

---

## Connection

```bash
# Provided automatically by Replit as DATABASE_URL environment variable
# Format: postgresql://user:password@host:5432/dbname
```

---

## Schema

### `affiliates` table

The core table. Every row is one affiliate partner.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `serial` | No | auto | Primary key |
| `name` | `text` | No | — | Full name |
| `email` | `text` | No | — | Unique. Used for login |
| `password_hash` | `text` | No | — | bcrypt hash (cost 12) |
| `whatsapp_number` | `text` | Yes | null | Contact for admin |
| `phone_number` | `text` | Yes | null | Optional secondary |
| `affiliate_code` | `text` | No | — | Unique 10-char code used in tracking links |
| `status` | `text` | No | `'pending'` | `pending \| active \| suspended` |
| `primary_platform` | `text` | Yes | null | Main social platform |
| `avg_engagement` | `text` | Yes | null | Self-reported engagement |
| `has_promoted_before` | `boolean` | Yes | null | Application question |
| `whatsapp_groups_reach` | `text` | Yes | null | WA groups/lists info |
| `tickets_sell_estimate` | `text` | Yes | null | `0-50 \| 50-100 \| 100+` |
| `estimated_reach` | `text` | Yes | null | Self-reported reach |
| `willing_to_promote` | `boolean` | Yes | null | Commitment question |
| `why_select_you` | `text` | Yes | null | Application pitch |
| `clicks` | `integer` | No | `0` | Total link clicks |
| `conversions` | `integer` | No | `0` | Paid referrals (the ranking metric) |
| `created_at` | `timestamp` | No | `now()` | Registration time |
| `updated_at` | `timestamp` | No | `now()` | Last updated |

**Indexes:**
- `email` — unique index (login lookup)
- `affiliate_code` — unique index (tracking lookup)
- `status` — index (filtering in admin)
- `conversions` — index (leaderboard sorting)

---

### `clicks` table

Stores individual click events (optional — for per-click analytics).

| Column | Type | Description |
|--------|------|-------------|
| `id` | `serial` | Primary key |
| `affiliate_id` | `integer` | FK → affiliates.id |
| `type` | `text` | `click \| conversion` |
| `ip_address` | `text` | Visitor IP (optional) |
| `user_agent` | `text` | Visitor browser (optional) |
| `created_at` | `timestamp` | When the event occurred |

---

### `activity` table

Audit log for all significant admin actions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `serial` | Primary key |
| `type` | `text` | Event type (e.g. `registration`, `account_approved`) |
| `description` | `text` | Human-readable description |
| `affiliate_name` | `text` | Name of affected affiliate |
| `affiliate_id` | `integer` | ID of affected affiliate (nullable) |
| `created_at` | `timestamp` | When it happened |

**Activity types used:**
- `registration` — new affiliate applied
- `account_approved` — admin approved an affiliate
- `account_suspended` — admin suspended
- `account_unsuspended` — admin restored
- `account_deleted` — admin deleted
- `conversion` — paid referral recorded

---

## Common Queries

```sql
-- Leaderboard top 50 (active affiliates only)
SELECT id, name, affiliate_code, primary_platform, clicks, conversions,
       RANK() OVER (ORDER BY conversions DESC, clicks DESC) AS rank
FROM affiliates
WHERE status = 'active'
ORDER BY conversions DESC, clicks DESC
LIMIT 50;

-- All pending affiliates
SELECT * FROM affiliates WHERE status = 'pending' ORDER BY created_at DESC;

-- Affiliate by code (for tracking)
SELECT id, name, clicks, conversions, status
FROM affiliates WHERE affiliate_code = $1;

-- Platform stats
SELECT primary_platform, COUNT(*) as count, SUM(conversions) as total_conversions
FROM affiliates WHERE status = 'active'
GROUP BY primary_platform ORDER BY total_conversions DESC;

-- Overall platform stats
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE status = 'active') AS active,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending,
  COUNT(*) FILTER (WHERE status = 'suspended') AS suspended,
  SUM(clicks) AS total_clicks,
  SUM(conversions) AS total_conversions
FROM affiliates;
```

---

## Schema Management

```bash
# Push schema changes to the database (development)
pnpm --filter @workspace/db run push

# View current schema
# See lib/db/src/schema/affiliates.ts

# Add a new column (example)
# 1. Add to schema file
# 2. Run: pnpm --filter @workspace/db run push
# 3. Update OpenAPI spec if exposed via API
# 4. Run: pnpm --filter @workspace/api-spec run codegen
```

> ⚠️ **Production databases**: Use `drizzle-kit generate` to create SQL migration files and apply them manually or via CI. Never run `push` against production — it can cause data loss on destructive changes.

---

## Backup & Restore

```bash
# Backup (run from any machine with psql access)
pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql "$DATABASE_URL" < backup_20250510_120000.sql
```

---

## Drizzle ORM Usage

```ts
import { db } from "@workspace/db";
import { affiliates } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";

// Find affiliate by code
const affiliate = await db.query.affiliates.findFirst({
  where: eq(affiliates.affiliateCode, code),
});

// Increment conversions atomically
await db.update(affiliates)
  .set({ conversions: sql`${affiliates.conversions} + 1` })
  .where(eq(affiliates.id, affiliateId));

// Leaderboard with rank
const leaderboard = await db
  .select()
  .from(affiliates)
  .where(eq(affiliates.status, "active"))
  .orderBy(desc(affiliates.conversions), desc(affiliates.clicks))
  .limit(50);
```
