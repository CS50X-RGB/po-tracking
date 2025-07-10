import { Request, Response } from "express";
import AdminDashboardRepo from "../database/repositories/adminDashboard";

class AdminDashboardService {
  private adminDashboard: AdminDashboardRepo;
  constructor() {
    this.adminDashboard = new AdminDashboardRepo();
  }

  public async getTotalPOCount(req: Request, res: Response) {
    try {
      const totalCount = await this.adminDashboard.getTotalPOCount();
      const totalPOvalue = await this.adminDashboard.getTotalPOValue();
      const openPOData = await this.adminDashboard.getOpenPO();
      const lineItemData = await this.adminDashboard.getlineItem();
      const dispatchedLIData = await this.adminDashboard.getLIDispatchedData();
      const deliveryStatusData =
        await this.adminDashboard.getDeliveryStatusdata();
      const avgOTD = await this.adminDashboard.getAvgOtd();
      const result = {
        totalPOCount: totalCount,
        totalPOValue: totalPOvalue,
        openPOData: openPOData,
        lineItemData: lineItemData,
        dispatchedLIData: dispatchedLIData,
        deliveryStatusData: deliveryStatusData,
        otd: avgOTD,
      };

      return res.sendFormatted(
        result,
        `Total Count Fetched Successfully ${totalCount} and total PO value is ${totalPOvalue} and total open PO count is ${openPOData}`,
        200,
      );
    } catch (error) {
      console.log("erorr getting total PO count");
      return res.sendError("error", "error", 500);
    }
  }

  public async getFullOtd(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.sendError(
          `Error while logging`,
          "Error while getting graph",
          400,
        );
      }
      const { year }: any = req.params;
      const { supplier, ...other }: any = req.user;
      const years =
        year === "NULL"
          ? [
              new Date().getFullYear(),
              new Date().getFullYear() - 1,
              new Date().getFullYear() - 2,
            ]
          : [year];
      let response = {};
      if (supplier === "NULL") {
        response = await this.adminDashboard.getFullOtd(years);
      } else {
        response = await this.adminDashboard.getFullOtd(years, supplier);
      }
      return res.sendArrayFormatted(response, "OTD Graph", 200);
    } catch (error) {
      return res.sendError(
        `Error while getting graph`,
        "Error whilte getting graph",
        400,
      );
    }
  }
}

export default AdminDashboardService;
