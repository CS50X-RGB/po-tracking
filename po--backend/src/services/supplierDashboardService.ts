import { Request, Response } from "express";
import SupplierDashboardRepo from "../database/repositories/supplierDashboardRepo";
import AdminDashboardRepo from "../database/repositories/adminDashboard";
import mongoose from "mongoose";

class SupplierDasboardService {
  private supplierDashboard: SupplierDashboardRepo;
  private adminDashboard: AdminDashboardRepo;

  constructor() {
    this.supplierDashboard = new SupplierDashboardRepo();
    this.adminDashboard = new AdminDashboardRepo();
  }

  public async getTotalPOData(req: Request, res: Response) {
    try {
      const supplierId = new mongoose.Types.ObjectId(req.user?.supplier);
      const totalPOData =
        await this.supplierDashboard.getTotalPOData(supplierId);
      const openPOData = await this.adminDashboard.getOpenPO(supplierId);
      const lineItemData = await this.adminDashboard.getlineItem(supplierId);
      const dispatchedLIData =
        await this.adminDashboard.getLIDispatchedData(supplierId);
      const needAttention = await this.adminDashboard.getFeedBack(supplierId);
      const deliveryStatusData =
        await this.adminDashboard.getDeliveryStatusdata(supplierId, null);
      const result = {
        totalPOData: totalPOData,
        openPOData: openPOData,
        lineItemData: lineItemData,
        dispatchedLIData: dispatchedLIData,
        needAttention: needAttention,
        deliveryStatusData: deliveryStatusData,
      };

      return res.sendFormatted(
        result,
        "Supplier analytics fetched successfully",
        200,
      );
    } catch (error) {
      console.log("erorr getting total PO data");
      return res.sendError("error", "error", 500);
    }
  }
}

export default SupplierDasboardService;
