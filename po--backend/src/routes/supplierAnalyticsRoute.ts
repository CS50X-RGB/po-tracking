import { Router } from "express";
import SupplierDasboardService from "../services/supplierDashboardService";
import UserMiddleware from "../middleware/userMiddleware";

const router = Router();
const userMiddleware = new UserMiddleware();
const SupplierDasboard = new SupplierDasboardService();

router.get(
  "/analyticsData",
  userMiddleware.verify.bind(userMiddleware),
  SupplierDasboard.getTotalPOData.bind(SupplierDasboard),
);

export default router;
