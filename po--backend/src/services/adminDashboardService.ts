import { Request, Response } from "express";
import AdminDashboardRepo from "../database/repositories/adminDashboard";

class AdminDashboardService {
  private adminDashboard: AdminDashboardRepo;
  constructor() {
    this.adminDashboard = new AdminDashboardRepo();
  }

  public async getTotalPOCount(req: Request, res: Response) {
    try {
      let { supplier, year }: any = req.query;
      const isSupplier = supplier !== "NULL";
      const isYear = year !== "NULL";

      let totalCount,
        totalPOvalue,
        openPOData,
        lineItemData,
        dispatchedLIData,
        deliveryStatusData,
        avgOTD;

      if (isYear && isSupplier) {
        totalCount = await this.adminDashboard.getTotalPOCount(
          year,
          undefined,
          supplier,
        );
        totalPOvalue = await this.adminDashboard.getTotalPOValue(
          year,
          undefined,
          supplier,
        );
        openPOData = await this.adminDashboard.getOpenPO(
          year,
          supplier,
          undefined,
        );
        lineItemData = await this.adminDashboard.getlineItem(
          year,
          supplier,
          undefined,
        );
        dispatchedLIData = await this.adminDashboard.getLIDispatchedData(
          year,
          supplier,
          undefined,
        );
        deliveryStatusData = await this.adminDashboard.getDeliveryStatusdata(
          supplier,
          undefined,
          year,
        );
        avgOTD = await this.adminDashboard.getAvgOtd(year, supplier);
      } else if (isYear) {
        // Only Year
        totalCount = await this.adminDashboard.getTotalPOCount(year);
        totalPOvalue = await this.adminDashboard.getTotalPOValue(year);
        openPOData = await this.adminDashboard.getOpenPO(year);
        lineItemData = await this.adminDashboard.getlineItem(year);
        dispatchedLIData = await this.adminDashboard.getLIDispatchedData(year);
        deliveryStatusData = await this.adminDashboard.getDeliveryStatusdata(
          null,
          null,
          year,
        );
        avgOTD = await this.adminDashboard.getAvgOtd(year);
      } else if (isSupplier) {
        // Only Supplier
        totalCount = await this.adminDashboard.getTotalPOCount(
          undefined,
          undefined,
          supplier,
        );
        totalPOvalue = await this.adminDashboard.getTotalPOValue(
          undefined,
          undefined,
          supplier,
        );
        openPOData = await this.adminDashboard.getOpenPO(undefined, supplier);
        lineItemData = await this.adminDashboard.getlineItem(
          undefined,
          supplier,
          undefined,
        );
        dispatchedLIData = await this.adminDashboard.getLIDispatchedData(
          undefined,
          supplier,
          undefined,
        );
        deliveryStatusData = await this.adminDashboard.getDeliveryStatusdata(
          supplier,
          null,
          undefined,
        );
        avgOTD = await this.adminDashboard.getAvgOtd(
          undefined,
          supplier,
          undefined,
        );
      } else {
        // Both "NULL" — fallback to overall totals
        totalCount = await this.adminDashboard.getTotalPOCount();
        totalPOvalue = await this.adminDashboard.getTotalPOValue();
        openPOData = await this.adminDashboard.getOpenPO();
        lineItemData = await this.adminDashboard.getlineItem();
        dispatchedLIData = await this.adminDashboard.getLIDispatchedData();
        deliveryStatusData = await this.adminDashboard.getDeliveryStatusdata();
        avgOTD = await this.adminDashboard.getAvgOtd();
      }

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

      const { year, supplier: supplierParam }: any = req.params;
      const { supplier: userSupplier, ...other }: any = req.user;

      const years =
        year === "NULL"
          ? [
              new Date().getFullYear(),
              new Date().getFullYear() - 1,
              new Date().getFullYear() - 2,
            ]
          : [parseInt(year)];

      let response = {};

      if (supplierParam === "NULL") {
        if (userSupplier) {
          response = await this.adminDashboard.getFullOtd(years, userSupplier);
        } else {
          response = await this.adminDashboard.getFullOtd(years);
        }
      } else {
        response = await this.adminDashboard.getFullOtd(years, supplierParam);
      }

      return res.sendArrayFormatted(response, "OTD Graph", 200);
    } catch (error) {
      return res.sendError(
        `Error while getting graph`,
        "Error while getting graph",
        400,
      );
    }
  }
}

export default AdminDashboardService;
