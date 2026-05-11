import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "fearless-week-2-secret-key-dot-platform";
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "admin-fearless-dot-secret";

export interface AffiliateJwtPayload {
  affiliateId: number;
  email: string;
}

export interface AdminJwtPayload {
  role: "admin";
  username: string;
}

export function signAffiliateToken(payload: AffiliateJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function signAdminToken(payload: AdminJwtPayload): string {
  return jwt.sign(payload, ADMIN_SECRET, { expiresIn: "24h" });
}

export function requireAffiliate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AffiliateJwtPayload;
    (req as Request & { affiliateId: number; affiliateEmail: string }).affiliateId = payload.affiliateId;
    (req as Request & { affiliateId: number; affiliateEmail: string }).affiliateEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : queryToken;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(token, ADMIN_SECRET) as AdminJwtPayload;
    if (payload.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export { JWT_SECRET };
