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
      const { year, supplier }: any = req.query;
      let totalPODataCount,
        totalPODatavalue,
        openPOData,
        lineItemData,
        dispatchedLIData,
        avgOTD,
        deliveryStatusData;
      const isSupplier = supplier !== "NULL";
      const isYear = year !== "NULL";
      console.log(year, supplier, "supplier");
      if (isSupplier && isYear) {
        // Condition 1
        totalPODataCount = await this.adminDashboard.getTotalPOCount(
          year,
          clientId,
          supplier,
        );
        totalPODatavalue = await this.adminDashboard.getTotalPOValue(
          year,
          clientId,
          supplier,
        );
        openPOData = await this.adminDashboard.getOpenPO(
          year,
          supplier,
          clientId,
        );
        lineItemData = await this.adminDashboard.getlineItem(
          year,
          supplier,
          clientId,
        );
        dispatchedLIData = await this.adminDashboard.getLIDispatchedData(
          year,
          supplier,
          clientId,
        );
        avgOTD = await this.adminDashboard.getAvgOtd(year, supplier, clientId);
        deliveryStatusData = await this.adminDashboard.getDeliveryStatusdata(
          supplier,
          clientId,
          year,
        );
      } else if (isSupplier && !isYear) {
        // Condition 2
        totalPODataCount = await this.adminDashboard.getTotalPOCount(
          undefined,
          clientId,
          supplier,
        );
        totalPODatavalue = await this.adminDashboard.getTotalPOValue(
          undefined,
          clientId,
          supplier,
        );
        openPOData = await this.adminDashboard.getOpenPO(
          undefined,
          supplier,
          clientId,
        );
        lineItemData = await this.adminDashboard.getlineItem(
          undefined,
          supplier,
          clientId,
        );
        dispatchedLIData = await this.adminDashboard.getLIDispatchedData(
          undefined,
          supplier,
          clientId,
        );
        avgOTD = await this.adminDashboard.getAvgOtd(
          undefined,
          supplier,
          clientId,
        );
        deliveryStatusData = await this.adminDashboard.getDeliveryStatusdata(
          supplier,
          clientId,
          undefined,
        );
      } else if (!isSupplier && isYear) {
        // Condition 3
        totalPODataCount = await this.adminDashboard.getTotalPOCount(
          year,
          clientId,
        );
        totalPODatavalue = await this.adminDashboard.getTotalPOValue(
          year,
          clientId,
        );
        openPOData = await this.adminDashboard.getOpenPO(
          year,
          undefined,
          clientId,
        );
        lineItemData = await this.adminDashboard.getlineItem(
          year,
          undefined,
          clientId,
        );
        dispatchedLIData = await this.adminDashboard.getLIDispatchedData(
          year,
          undefined,
          clientId,
        );
        avgOTD = await this.adminDashboard.getAvgOtd(year, undefined, clientId);
        deliveryStatusData = await this.adminDashboard.getDeliveryStatusdata(
          undefined,
          clientId,
          year,
        );
      } else {
        // Condition 4: Neither
        totalPODataCount = await this.adminDashboard.getTotalPOCount(
          undefined,
          clientId,
        );
        totalPODatavalue = await this.adminDashboard.getTotalPOValue(
          undefined,
          clientId,
        );
        openPOData = await this.adminDashboard.getOpenPO(
          undefined,
          undefined,
          clientId,
        );
        lineItemData = await this.adminDashboard.getlineItem(
          undefined,
          undefined,
          clientId,
        );
        dispatchedLIData = await this.adminDashboard.getLIDispatchedData(
          undefined,
          undefined,
          clientId,
        );
        avgOTD = await this.adminDashboard.getAvgOtd(
          undefined,
          undefined,
          clientId,
        );
        deliveryStatusData = await this.adminDashboard.getDeliveryStatusdata(
          undefined,
          clientId,
          undefined,
        );
      }

      const result = {
        totalPODataCount: totalPODataCount,
        totalPODatavalue: totalPODatavalue,
        openPOData: openPOData,
        lineItemData: lineItemData,
        deliveryStatusData,
        dispatchedLIData: dispatchedLIData,
        avgOTD,
      };

      return res.sendFormatted(
        result,
        "Client analytics fetched successfully",
        200,
      );
    } catch (error) {
      console.log("erorr getting total PO data");
      return res.sendError("error", "error", 500);
    }
  }
}

export default clientDasboardService;
