import * as dotenv from "dotenv";
import { join } from "path";

// Load environment variables
dotenv.config({ path: join(process.cwd(), "../../.env") });
dotenv.config({ path: join(process.cwd(), ".env") });
dotenv.config();

import app from "./app.js";

// Export for Vercel serverless
export default app;
