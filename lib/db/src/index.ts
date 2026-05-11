import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import * as dotenv from "dotenv";
import { join } from "path";

// Support loading .env from project root if not already loaded
dotenv.config({ path: join(process.cwd(), "../../.env") });
dotenv.config({ path: join(process.cwd(), "../../../.env") });
dotenv.config({ path: join(process.cwd(), ".env") });
dotenv.config(); // Fallback to local .env

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";
