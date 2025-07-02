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

      const result = {
        totalPOCount: totalCount,
        totalPOValue: totalPOvalue,
        openPOData: openPOData,
        lineItemData: lineItemData,
        dispatchedLIData: dispatchedLIData,
        deliveryStatusData: deliveryStatusData,
      };

      //console.log(totalCount);
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
}

export default AdminDashboardService;
