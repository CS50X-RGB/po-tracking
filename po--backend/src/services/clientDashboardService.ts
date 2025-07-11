import { Request, Response } from "express";
import AdminDashboardRepo from "../database/repositories/adminDashboard";
import mongoose from "mongoose";

class clientDasboardService {
  private adminDashboard: AdminDashboardRepo;

  constructor() {
    this.adminDashboard = new AdminDashboardRepo();
  }

  public async getTotalPOData(req: Request, res: Response) {
    try {
      const clientId = new mongoose.Types.ObjectId(req.user?.client);

      const totalPODataCount = await this.adminDashboard.getTotalPOCount(
        undefined,
        clientId,
      );
      const totalPODatavalue = await this.adminDashboard.getTotalPOValue(
        undefined,
        clientId,
      );
      const openPOData = await this.adminDashboard.getOpenPO(
        undefined,
        undefined,
        clientId,
      );
      const lineItemData = await this.adminDashboard.getlineItem(
        undefined,
        undefined,
        clientId,
      );
      const dispatchedLIData = await this.adminDashboard.getLIDispatchedData(
        undefined,
        undefined,
        clientId,
      );
      const result = {
        totalPODataCount: totalPODataCount,
        totalPODatavalue: totalPODatavalue,
        openPOData: openPOData,
        lineItemData: lineItemData,
        dispatchedLIData: dispatchedLIData,
      };

      return res.sendFormatted(
        result,
        "client analytics fetched successfully",
        200,
      );
    } catch (error) {
      console.log("erorr getting total PO data");
      return res.sendError("error", "error", 500);
    }
  }
}

export default clientDasboardService;
