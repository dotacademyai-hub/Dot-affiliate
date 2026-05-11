import "dotenv/config";
import bcrypt from "bcryptjs";
import { db, affiliatesTable } from "@workspace/db";
import { nanoid } from "nanoid";

async function createTestUser() {
  const name = "Test Affiliate";
  const email = "test@example.com";
  const password = "password123";

  console.log(`Creating test user: ${email} / ${password}`);

  const passwordHash = await bcrypt.hash(password, 12);
  const affiliateCode = nanoid(10).toUpperCase();

  try {
    const [user] = await db.insert(affiliatesTable).values({
      name,
      username: "test_affiliate",
      email,
      passwordHash,
      whatsappNumber: "+2348000000000",
      affiliateCode,
      status: "active", // Create as active so it can be used immediately
      primaryPlatform: "instagram",
      avgEngagement: "High",
      hasPromotedBefore: true,
      whatsappGroupsReach: "5 groups",
      ticketsSellEstimate: "50-100",
      whySelectYou: "I am a test user.",
      willingToPromote: true,
    }).returning();

    console.log("Successfully created test user!");
    console.log("ID:", user.id);
    console.log("Email:", user.email);
    console.log("Code:", user.affiliateCode);
    process.exit(0);
  } catch (err: any) {
    if (err.code === '23505') {
      console.error("User already exists!");
    } else {
      console.error("Error creating user:", err.message);
    }
    process.exit(1);
  }
}

createTestUser();
