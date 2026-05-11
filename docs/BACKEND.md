# DOT Affiliates — Backend API Documentation

## Overview

The backend is an **Express 5** REST API running on Node.js 24. All routes are prefixed with `/api` and routed through the shared reverse proxy. The API is built contract-first — the OpenAPI spec in `lib/api-spec/` is the source of truth for all request/response shapes.

---

## Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:80/api` |
| Production  | `https://<your-domain>/api` |

---

## Authentication

Two separate JWT flows exist:

| Token | Header | Storage Key | Issued by |
|-------|--------|-------------|-----------|
| Affiliate | `Authorization: Bearer <token>` | `affiliateToken` (localStorage) | `POST /api/auth/login` |
| Admin | `Authorization: Bearer <token>` | `adminToken` (localStorage) | `POST /api/admin/login` |

Tokens are signed with `JWT_SECRET` (defaults to env var). Admin tokens carry a special `isAdmin: true` claim checked by `requireAdmin` middleware.

Tokens expire after **7 days**. On 401, the custom fetch client auto-clears the stored token and redirects to the appropriate login page.

---

## Route Reference

### Auth (`/api/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | None | Register a new affiliate (status: `pending`) |
| `POST` | `/api/auth/login` | None | Affiliate login — returns JWT |
| `POST` | `/api/auth/logout` | Affiliate | Invalidate session (client-side token drop) |
| `GET`  | `/api/auth/me` | Affiliate | Get current affiliate profile |

**Register body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string (min 8)",
  "whatsappNumber": "string",
  "phoneNumber": "string | null",
  "primaryPlatform": "instagram | tiktok | twitter | snapchat | whatsapp | facebook",
  "avgEngagement": "string",
  "hasPromotedBefore": "boolean",
  "whatsappGroupsReach": "string",
  "ticketsSellEstimate": "0-50 | 50-100 | 100+",
  "estimatedReach": "string | null",
  "willingToPromote": "boolean",
  "whySelectYou": "string"
}
```

---

### Affiliate Self-Service (`/api/affiliate`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/api/affiliate/me` | Affiliate | Dashboard data (profile + stats) |
| `PUT`  | `/api/affiliate/settings` | Affiliate | Update name, WhatsApp, platform |
| `POST` | `/api/affiliate/password` | Affiliate | Change password |

**Settings body:**
```json
{
  "name": "string",
  "whatsappNumber": "string",
  "phoneNumber": "string | null",
  "primaryPlatform": "string"
}
```

---

### Public (`/api/public`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/api/public/leaderboard` | None | Top 50 active affiliates by conversions |
| `POST` | `/api/public/track` | None | Record a click or conversion event |

**Track body:**
```json
{
  "code": "AFFILIATE_CODE",
  "type": "click | conversion"
}
```

> ⚠️ Only `type: "conversion"` increments the affiliate's paid referral count and leaderboard position. `type: "click"` only increments the click counter.

---

### Admin (`/api/admin`)

All admin routes require `Authorization: Bearer <adminToken>`. The admin dashboard is located at `/fearless-control-gate-2025`.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Admin auth — returns JWT (shared with affiliate login) |
| `GET`  | `/api/admin/stats` | Platform overview stats |
| `GET`  | `/api/admin/affiliates` | Paginated affiliate list (search, filter by status) |
| `GET`  | `/api/admin/activity` | Full activity log |
| `GET`  | `/api/admin/top-performers` | Top 10 affiliates by conversions |
| `POST` | `/api/admin/affiliates/:id/approve` | Approve a pending affiliate |
| `POST` | `/api/admin/affiliates/:id/suspend` | Suspend an active affiliate |
| `POST` | `/api/admin/affiliates/:id/unsuspend` | Restore a suspended affiliate |
| `DELETE` | `/api/admin/affiliates/:id` | Permanently delete an affiliate |

**Admin list query params:**
- `?status=active|pending|suspended` — filter by status
- `?search=name_or_email` — fuzzy search
- `?page=1&limit=15` — pagination

**Default admin credentials** (override via env vars):
- Username: `ADMIN_USERNAME` (default: `admin`)
- Password: `ADMIN_PASSWORD` (default: `fearless2025admin`)

---

## Error Format

All errors follow this shape:

```json
{
  "error": "Human-readable message"
}
```

Common status codes:
- `400` — Validation error (missing/invalid fields)
- `401` — Unauthenticated or expired token
- `403` — Forbidden (wrong role)
- `404` — Resource not found
- `409` — Conflict (e.g. email already registered)
- `500` — Internal server error (check API server logs)

---

## Running the API

```bash
# Development (auto-rebuilds on change)
pnpm --filter @workspace/api-server run dev

# Check logs
# View via Replit workflow console

# Regenerate hooks from OpenAPI spec after changes
pnpm --filter @workspace/api-spec run codegen
```

---

## Adding New Routes

1. Update `lib/api-spec/openapi.yaml` with the new endpoint
2. Run `pnpm --filter @workspace/api-spec run codegen` to regenerate hooks
3. Add the route handler in `artifacts/api-server/src/routes/`
4. Register it in `artifacts/api-server/src/routes/index.ts`
5. Use `req.log` (not `console.log`) for all server-side logging

---

## Logging

The API uses **pino** for structured JSON logging. Never use `console.log` in server code:

```ts
// In route handlers
req.log.info({ affiliateId }, "Affiliate approved");
req.log.error({ err }, "Failed to process conversion");

// Outside request context
import { logger } from "../lib/logger";
logger.info("Server started");
```
