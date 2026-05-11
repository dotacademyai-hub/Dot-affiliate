import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import affiliateRouter from "./affiliate.js";
import publicRouter from "./public.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(affiliateRouter);
router.use(publicRouter);
router.use(adminRouter);

export default router;
