import { nanoid } from "nanoid";

export function generateAffiliateCode(): string {
  return nanoid(10).toUpperCase();
}
