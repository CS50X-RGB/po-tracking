import { Router } from "express";
import clientDasboardService from "../services/clientDashboardService";
import UserMiddleware from "../middleware/userMiddleware";

const router = Router();
const userMiddleware = new UserMiddleware();
const clientDasboard = new clientDasboardService();

router.get(
  "/analyticsData",
  userMiddleware.verify.bind(userMiddleware),
  clientDasboard.getTotalPOData.bind(clientDasboard),
);

export default router;
