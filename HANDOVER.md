# DOT Affiliates — AI Handover & Context Document

This document is for future AI assistants (Trae/Copilot) to understand the current state of the project and continue development without context loss.

## Project Overview
A full-stack affiliate platform for "FEARLESS WEEK 2.0". Influencers apply, get a tracking link, and earn rewards based on **paid referrals** on an external Sellenda checkout page.

## Tech Stack
- **Monorepo**: pnpm workspaces.
- **Frontend**: React + Vite + Tailwind v4 + shadcn/ui.
- **Backend**: Express 5 (Node.js 24).
- **DB**: PostgreSQL (Neon.tech) + Drizzle ORM.
- **Email**: Nodemailer via `dotacademy.ai@gmail.com`.

## Key Features & Custom Logic

### 1. Token-Based Tracking (Cheat-Proof)
- **Flow**: User clicks `/api/go/sellenda?aff=CODE` -> Backend generates a `nanoid` token -> Stores it in `clicks` table -> Sets a 24h `SameSite=Lax` first-party cookie (`aff_token`) -> Redirects to static Sellenda URL.
- **Conversion**: Sellenda redirects to `/api/success` -> Backend reads cookie -> Finds token in DB -> Marks as paid -> Increments affiliate's `conversions`.

### 2. Notification System
- **Emails**: Fully automated via `artifacts/api-server/src/lib/email.ts`.
- **WhatsApp**: **Manual only**. Admin dashboard provides `wa.me` links with pre-filled templates. Automated WhatsApp (Green API) was intentionally removed.

### 3. Verification Workflow
- New signups are `status: 'pending'`.
- Dashboards show a "Under Review" banner and hide the tracking link until an admin approves them via the `/fearless-control-gate-2025` panel.

## Critical Files
- `artifacts/api-server/src/routes/public.ts`: Contains the redirector and success page logic.
- `lib/db/src/schema/`: Database table definitions.
- `artifacts/dot-affiliates/src/pages/Dashboard.tsx`: Affiliate UI and link generation.
- `.env`: Contains `DATABASE_URL` and `EMAIL_PASSWORD`.

## Pending Tasks / Next Steps
- [ ] Monitor the `EMAIL_PASSWORD` setup (User needs to add Gmail App Password).
- [ ] Integrate with real Sellenda webhooks if they ever support server-to-server postbacks (currently using cookie-based redirect).
- [ ] Add more analytics (IP tracking, device info) to the `clicks` table.
