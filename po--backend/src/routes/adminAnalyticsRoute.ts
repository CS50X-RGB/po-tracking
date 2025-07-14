import { Router } from "express";
import AdminDashboardService from "../services/adminDashboardService";
import UserMiddleware from "../middleware/userMiddleware";

const router = Router();

const adminDashboardService = new AdminDashboardService();
const userMiddleware = new UserMiddleware();

router.get(
  "/totalPOCount",
  adminDashboardService.getTotalPOCount.bind(adminDashboardService),
);

router.get(
  "/otd/:year/:supplier",
  userMiddleware.verify.bind(userMiddleware),
  adminDashboardService.getFullOtd.bind(adminDashboardService),
);

export default router;
