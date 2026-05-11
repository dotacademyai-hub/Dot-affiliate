# DOT Affiliates — FEARLESS WEEK 2.0

Full-stack affiliate marketing platform for FEARLESS WEEK 2.0 by DOT. Influencers apply to become affiliates, get a unique tracking link, and earn rewards based on confirmed paid referrals.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/dot-affiliates run dev` — run the frontend (auto-assigned port)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + TailwindCSS v4 + shadcn/ui
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Auth: JWT (bcryptjs + jsonwebtoken) stored in localStorage
- Build: esbuild (CJS bundle for API), Vite (frontend)

## Where things live

- `artifacts/dot-affiliates/` — React frontend (Vite)
  - `src/pages/Home.tsx` — landing page with hero, how-it-works, leaderboard, support
  - `src/pages/Auth.tsx` — login + 4-step signup form
  - `src/pages/Dashboard.tsx` — affiliate metrics & link
  - `src/pages/Settings.tsx` — profile & password settings
  - `src/pages/admin/AdminDashboard.tsx` — full admin control panel
  - `src/index.css` — theme variables (dark/light HSL + animated green mesh)
- `artifacts/api-server/` — Express API
  - `src/routes/auth.ts` — register/login/logout/me
  - `src/routes/affiliate.ts` — affiliate self-service routes
  - `src/routes/public.ts` — leaderboard + tracking pixel
  - `src/routes/admin.ts` — all admin CRUD routes
  - `src/middlewares/auth.ts` — JWT middleware (affiliate + admin)
- `lib/db/src/schema/` — Drizzle schema (affiliates, clicks, activity)
- `lib/api-spec/` — OpenAPI spec (source of truth for all contracts)
- `lib/api-client-react/src/custom-fetch.ts` — auth header injection + 401 auto-redirect

## Architecture decisions

- **Paid-referrals-only model**: The leaderboard and rewards are based on `conversions` (paid purchases), not raw clicks. Clicks are tracked separately.
- **JWT in localStorage**: Affiliates use `affiliateToken`; admins use `adminToken`. The custom fetcher picks the right one automatically.
- **OpenAPI-first**: All routes are defined in the spec first, then Orval generates React Query hooks + Zod schemas. Do not hand-write fetch calls.
- **Admin via separate secret**: Admin auth uses `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars (defaulting to `admin`/`fearless2025admin`) and issues a separate `adminToken`.
- **Activity logging**: All significant admin actions (approve, suspend, delete) are logged to the `activity` table.

## Product

- **Landing page**: Hero with FEARLESS WEEK 2.0 branding, how-it-works, perks, live leaderboard (top 50), WhatsApp support, paid-referrals disclosure banner
- **Affiliate auth**: Login + 4-step signup (personal info → platform → experience → why me)
- **Affiliate dashboard**: Affiliate link with copy button, paid referral count, click count, rank, conversion rate, support button
- **Settings**: Edit profile, change password, logout
- **Admin panel**: Stats overview, full affiliates table (search/filter/paginate), approve/suspend/unsuspend/delete/WhatsApp contact, activity log, top performers

## Demo Credentials

- **Affiliate login**: `chidi@example.com` / `password123` (active, ranked #1)
- **Pending user**: `demo@example.com` / `password123`
- **Admin**: `admin` / `fearless2025admin` at `/admin`

## User preferences

- Theme: obsidian black + electric green dark mode (default); cream white + green light mode
- Only paid referrals count toward leaderboard and rewards — prominently displayed across UI
- WhatsApp support button always accessible
- Logo file: `attached_assets/f45832e5-fd75-4649-94b8-25101588a119_removalai_preview_1778429832966.png`

## Gotchas

- Admin routes require `adminToken` in localStorage; affiliate routes require `affiliateToken`
- The custom-fetch.ts prefers `adminToken` over `affiliateToken` when both exist
- `pnpm --filter @workspace/db run push` must be run after schema changes before seeding
- Do not run `pnpm dev` at the workspace root — use workflow restart instead

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- API codegen: `pnpm --filter @workspace/api-spec run codegen` regenerates all hooks after spec changes
