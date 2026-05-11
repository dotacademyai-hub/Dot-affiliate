import type { IncomingMessage, ServerResponse } from "node:http";
import app from "./app.js";

// Vercel serverless handler
// Note: Environment variables are set in Vercel dashboard, not .env files
export default function handler(req: IncomingMessage, res: ServerResponse) {
  console.log(`[Vercel] ${req.method} ${req.url}`);
  try {
    // @ts-ignore - Express app works as a handler
    return app(req, res);
  } catch (err) {
    console.error('[Vercel] Error:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Server error' }));
  }
}
