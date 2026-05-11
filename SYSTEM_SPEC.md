# DOT Affiliates — Complete System Specification

This document provides a comprehensive technical and functional breakdown of the DOT Affiliates platform. Use this as a blueprint for cloning, auditing, or extending the system.

---

## 1. System Architecture & Tech Stack

The platform is built as a **TypeScript Monorepo** using `pnpm` workspaces, following a contract-first approach with OpenAPI.

### Core Components
- **Frontend (`artifacts/dot-affiliates`)**: 
    - **Framework**: React + Vite + Tailwind CSS.
    - **UI**: Shadcn UI + Lucide Icons + Framer Motion (for animations).
    - **Routing**: `wouter` for lightweight, hook-based routing.
    - **Data Fetching**: `TanStack Query` (React Query) for caching and optimistic updates.
- **Backend API (`artifacts/api-server`)**: 
    - **Server**: Express.js (v5).
    - **ORM**: Drizzle ORM for type-safe database queries.
    - **Validation**: `Zod` (schemas auto-generated from OpenAPI).
- **Database (`lib/db`)**: 
    - **Provider**: PostgreSQL (hosted on Neon.tech).
    - **Schema**: Shared library used by both the API and migration tools.
- **API Specification (`lib/api-spec`)**: 
    - **Standard**: OpenAPI 3.1.
    - **Generation**: Automatically produces TypeScript types, Zod schemas, and React hooks for the entire monorepo.

---

## 2. The WhatsApp Contact System (Manual & Automated)

The platform utilizes a "Hybrid WhatsApp System" to ensure reliability without the costs or complexity of a dedicated API like Green API.

### A. Affiliate-to-Admin (Support)
- **Static Links**: Every support button on the Landing Page and Dashboard is a `wa.me` link pointing to `+234 911 489 6168`.
- **Pre-filled Context**: When clicked, it opens WhatsApp with a generic message like *"Hello DOT Support, I need help with my affiliate account."*

### B. Admin-to-Affiliate (The Management Flow)
This is where the platform excels in managing affiliates manually but efficiently:
1.  **Status Change Triggers**: In the Admin Dashboard, every affiliate row has a WhatsApp icon.
2.  **Smart Message Generation**: The backend dynamically generates pre-filled messages based on the action needed:
    - **On Signup**: *"Hello [Name], we've received your application for DOT Affiliates. We are reviewing it now!"*
    - **On Approval**: *"Congratulations [Name]! Your account is active. Your link is: [Link]. Login at: [URL]"*
    - **On Milestone**: *"Great job [Name]! You just hit [X] conversions!"*
3.  **Manual Send (One-Click)**: When the Admin clicks the WhatsApp button, it opens a new tab with the affiliate's phone number and the message ready. The Admin only needs to press "Send" in WhatsApp Web or the Mobile App.

---

## 3. The Platform Lifecycle (End-to-End Flow)

### Phase 1: Onboarding
1.  **Public Visit**: User lands on the Home page, views the live Leaderboard, and clicks "Join Now".
2.  **Signup**: User completes a 4-step form. 
    - *Technical Detail*: The backend checks for unique Email and Username. It hashes the password using `bcryptjs`.
3.  **Admin Alert**: An automated email is sent to `dotacademy.ai@gmail.com` with the full profile of the new applicant.
4.  **Review**: Admin logs into the secret panel (`/fearless-control-gate-2025`), reviews the application, and clicks "Approve".
5.  **Confirmation**: The system sends an automated approval email to the affiliate, and the Admin uses the WhatsApp button to send a personal welcome message.

### Phase 2: Promotion & Tracking
1.  **The Link**: The approved affiliate gets a code (e.g., `JOHNDOE123`). Their link is `https://dotacademy.ai/api/go/sellenda?aff=JOHNDOE123`.
2.  **The Click**: A customer clicks the link.
    - *The Redirector*: The backend logs the click (IP, Device, Time) and generates a unique `nanoid` tracking token.
    - *The Cookie*: The server sets an `aff_token` cookie (HTTP-Only, Secure) on the customer's browser.
    - *The Destination*: Customer is redirected to the Sellenda checkout page.
3.  **The Purchase**: The customer buys the product on Sellenda.
4.  **The Success Page**: Sellenda redirects the customer back to `https://dotacademy.ai/api/success`.

### Phase 3: Conversion & Reward
1.  **Validation**: The `/api/success` route reads the `aff_token` cookie from the customer's browser.
2.  **Attribution**: The system finds the original click record matching that token and identifies the affiliate (e.g., John Doe).
3.  **Update**: 
    - Affiliate's `conversions` count increments.
    - An `activity` log is created.
    - An in-app notification appears for the Admin.
    - An automated email is sent to the Admin notifying them of the sale.
4.  **Leaderboard Update**: The public leaderboard refreshes to show the affiliate's new rank.

---

## 4. User Roles & Permissions

### Public (Guest)
- View landing page and live leaderboard.
- Apply to become an affiliate.

### Affiliate (User)
- Access personal dashboard via `/auth`.
- View personal clicks, conversions, and global rank.
- Update profile settings and password.
- Get personal tracking link.

### Admin (Superuser)
- Access via the same `/auth` gate (recognizes admin credentials).
- Redirected to secret path: `/fearless-control-gate-2025`.
- Full CRUD (Create, Read, Update, Delete) on all affiliates.
- View global activity logs and detailed performance stats.
- Manual WhatsApp outreach system.

---

## 5. Security & Infrastructure

- **Authentication**: JWT-based (JSON Web Tokens). Separate secrets for Admin and Affiliate tokens to prevent privilege escalation.
- **Obscurity**: No "Admin Login" link exists. The Admin dashboard path is secret.
- **Data Integrity**: Database transactions ensure that conversion counts never drift from the activity logs.
- **SMTP**: Uses Gmail SMTP with App Passwords for all system emails.

---

## 6. Deployment Prerequisites (.env)

To clone this system, you must configure:
- `DATABASE_URL`: Neon.tech PostgreSQL connection string.
- `JWT_SECRET`: Secret key for affiliate sessions.
- `ADMIN_SECRET`: Secret key for admin-only routes.
- `ADMIN_USERNAME` / `ADMIN_PASSWORD`: Your secret credentials.
- `EMAIL_PASSWORD`: Gmail App Password for `dotacademy.ai@gmail.com`.
- `APP_URL`: The live domain (used for generating tracking links).
