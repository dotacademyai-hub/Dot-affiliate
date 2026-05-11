# DOT Affiliates — Setup & Testing Guide

This guide covers everything you need to run, test, and fully implement the DOT Affiliates platform.

## 1. Prerequisites & Installation

Before running the project, ensure you have the following installed:
- **Node.js 24+**
- **pnpm** (Install via `npm install -g pnpm`)
- **PostgreSQL Database** (You are currently using Neon.tech)

### Installation Steps
```bash
# Install all dependencies
pnpm install

# Update the database schema (Crucial for tracking)
# Ensure your DATABASE_URL is in the .env file first
pnpm --filter @workspace/db run push
```

## 2. Environment Variables
Your `.env` file in the root directory should contain:

```env
# Database (Neon.tech)
DATABASE_URL="postgresql://neondb_owner:npg_iu3UhQjqH0eS@ep-square-glade-aqctm69b.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Auth Secrets
SESSION_SECRET="fearless-week-2-secret-key-dot-platform"
JWT_SECRET="fearless-week-2-secret-key-dot-platform"
ADMIN_SECRET="admin-fearless-dot-secret"

# Admin Credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="fearless2025admin"

# Email Notifications (Automated via dotacademy.ai@gmail.com)
# You MUST provide a Gmail App Password
EMAIL_PASSWORD="your_gmail_app_password_here"
ADMIN_NOTIFY_EMAIL="dotacademy.ai@gmail.com"

# App URL (Used for generating links)
APP_URL="http://localhost:8080"
PORT="8080"
```

## 3. How to Run the Project

### Start Backend (API)
```bash
pnpm --filter @workspace/api-server run dev
```

### Start Frontend (UI)
```bash
pnpm --filter @workspace/dot-affiliates run dev
```

---

## 4. Notification Systems

### Automated Emails
The system sends automated emails from `dotacademy.ai@gmail.com` for:
- **Affiliates**: Signup confirmation, Application approval (with link), Account suspension, and Reactivation.
- **Admins**: Alerts when a new application is submitted.

### Manual WhatsApp
Green API has been removed. Instead, the Admin Dashboard provides **WhatsApp buttons** that open a pre-filled message (`wa.me`) for you to send manually to affiliates when their status changes.

---

## 5. Tracking & Success Page
- **Redirector**: `http://localhost:8080/api/go/sellenda?aff=CODE`
- **Success Page**: `http://localhost:8080/api/success`
- **Message**: Displays "Payment Successful! ... Check your ticket in your email shortly."

---

## 6. Testing Guide

### Use Case 1: Test User Login
1. Start Backend & Frontend.
2. Login at `http://localhost:5173/auth` with:
   - **Email**: `test@example.com`
   - **Password**: `password123`
3. **Verify**: You see your unique tracking link and current stats.

### Use Case 2: Admin Flow
1. Visit `http://localhost:5173/auth`.
2. Login with Admin credentials (`admin` / `fearless2025admin`).
3. **Verify**: You are redirected to the secret admin dashboard at `/fearless-control-gate-2025`.
4. Manage affiliates and use the **WhatsApp icons** to send manual updates.

### Use Case 3: Tracking Test
1. Copy the tracking link from the affiliate dashboard.
2. Visit it in an **Incognito window**.
3. Manually visit `http://localhost:8080/api/success` to simulate a sale.
4. **Verify**: The "Paid Referrals" count increases on the dashboard.
