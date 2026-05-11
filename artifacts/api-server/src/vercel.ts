import * as dotenv from "dotenv";
import { join } from "path";

// Load environment variables
dotenv.config({ path: join(process.cwd(), "../../.env") });
dotenv.config({ path: join(process.cwd(), ".env") });
dotenv.config();

import type { IncomingMessage, ServerResponse } from "node:http";
import app from "./app.js";

// Vercel serverless handler
export default function handler(req: IncomingMessage, res: ServerResponse) {
  // @ts-ignore - Express app works as a handler
  return app(req, res);
}
