import { Router, Request, Response } from "express";
import { z } from "zod";

const HealthCheckResponse = z.object({
  status: z.string(),
});

const router = Router();

router.get("/healthz", (_req: Request, res: Response) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
