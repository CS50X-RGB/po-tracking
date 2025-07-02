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

      console.log("client id is ", clientId);
      console.log("Type of clientId:", typeof clientId);

      const totalPODataCount =
        await this.adminDashboard.getTotalPOCount(clientId);
      const totalPODatavalue =
        await this.adminDashboard.getTotalPOValue(clientId);
      const openPOData = await this.adminDashboard.getOpenPO(clientId);
      const lineItemData = await this.adminDashboard.getlineItem(clientId);
      const dispatchedLIData =
        await this.adminDashboard.getLIDispatchedData(clientId);
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
