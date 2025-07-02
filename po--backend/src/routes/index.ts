import { Router } from "express";
import roleRouter from "./roleRoute";
import userRouter from "./userRoute";
import partNumberRouter from "./partNumberRoute";
import uomRouter from "./uomRoute";
import masterRouter from "./masterDataRoute";
import poRouter from "./purchaseOrderRoute";
import progressUpdateRouter from "./progressUpdateRouter";
import adminAnalyticsRouter from "./adminAnalyticsRoute";
import supplierAnalyticsRouter from "./supplierAnalyticsRoute";

const router = Router();
const version = "v1";
const webRoute = "web";
export const prefix = `/${version}/${webRoute}`;

router.use(`${prefix}/role`, roleRouter);
router.use(`${prefix}/user`, userRouter);
router.use(`${prefix}/part`, partNumberRouter);
router.use(`${prefix}/uom`, uomRouter);
router.use(`${prefix}/master`, masterRouter);
router.use(`${prefix}/po`, poRouter);
router.use(`${prefix}/progressUpdate`, progressUpdateRouter);
router.use(`${prefix}/adminAnalytics`, adminAnalyticsRouter);
router.use(`${prefix}/supplierAnalytics`, supplierAnalyticsRouter);
export default router;
