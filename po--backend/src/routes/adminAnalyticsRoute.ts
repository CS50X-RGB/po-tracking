import { Router } from "express";
import AdminDashboardService from "../services/adminDashboardService";

const router = Router();

const adminDashboardService = new AdminDashboardService();

router.get(
  "/totalPOCount",
  adminDashboardService.getTotalPOCount.bind(adminDashboardService),
);

export default router;
