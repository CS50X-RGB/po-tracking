import { Router } from "express";
import SupplierDasboardService from "../services/supplierDashboardService";
import UserMiddleware from "../middleware/userMiddleware";

const router = Router();
const userMiddleware = new UserMiddleware();
const supplierDasboard = new SupplierDasboardService();

router.get(
  "/analyticsData",
  userMiddleware.verify.bind(userMiddleware),
  supplierDasboard.getTotalPOData.bind(supplierDasboard),
);

export default router;
