import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app = express();

app.use(
  (pinoHttp as any)({
    logger,
    serializers: {
      req(req: any) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: any) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug: log all requests
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url} (path: ${req.path}, originalUrl: ${req.originalUrl})`);
  next();
});

// Debug: catch-all route to see what paths are received
app.all("*", (req, res, next) => {
  console.log(`[CATCHALL] ${req.method} ${req.path} - headers: ${JSON.stringify(req.headers['x-vercel-rewritten-path'] || 'none')}`);
  if (req.path === '/' || req.path === '/api') {
    return res.json({ debug: true, method: req.method, path: req.path, url: req.url, originalUrl: req.originalUrl });
  }
  next();
});

app.use("/api", router);
// Also try at root in case Vercel strips the /api prefix
app.use(router);

// Simple test endpoint
app.get("/test", (req, res) => {
  res.json({ ok: true, path: req.path, url: req.url });
});
app.get("/api/test", (req, res) => {
  res.json({ ok: true, path: req.path, url: req.url });
});

export default app;
