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
      const { year }: any = req.query;
      const supplierId = new mongoose.Types.ObjectId(req.user?.supplier);
      let totalCount,
        totalPOvalue,
        openPOData,
        lineItemData,
        dispatchedLIData,
        deliveryStatusData,
        needAttention,
        avgOTD;
      if (year !== "NULL") {
        totalCount = await this.supplierDashboard.getTotalPOData(
          supplierId,
          year,
        );
        openPOData = await this.adminDashboard.getOpenPO(year, supplierId);
        lineItemData = await this.adminDashboard.getlineItem(year, supplierId);
        dispatchedLIData = await this.adminDashboard.getLIDispatchedData(
          year,
          supplierId,
        );
        needAttention = await this.adminDashboard.getFeedBack(supplierId);
        deliveryStatusData = await this.adminDashboard.getDeliveryStatusdata(
          supplierId,
          null,
          year,
        );
        avgOTD = await this.adminDashboard.getAvgOtd(year, supplierId);
      } else {
        totalCount = await this.supplierDashboard.getTotalPOData(supplierId);
        openPOData = await this.adminDashboard.getOpenPO(undefined, supplierId);
        lineItemData = await this.adminDashboard.getlineItem(
          undefined,
          supplierId,
        );
        dispatchedLIData = await this.adminDashboard.getLIDispatchedData(
          undefined,
          supplierId,
        );
        needAttention = await this.adminDashboard.getFeedBack(supplierId);
        deliveryStatusData = await this.adminDashboard.getDeliveryStatusdata(
          supplierId,
          null,
        );
        avgOTD = await this.adminDashboard.getAvgOtd(undefined, supplierId);
      }

      const result = {
        totalPOData: totalCount,
        openPOData: openPOData,
        lineItemData: lineItemData,
        dispatchedLIData: dispatchedLIData,
        needAttention: needAttention,
        deliveryStatusData: deliveryStatusData,
        avgOtd: avgOTD,
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
