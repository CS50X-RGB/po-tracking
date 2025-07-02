import { Request, Response } from "express";
import SupplierDashboardRepo from "../database/repositories/supplierDashboardRepo";
import mongoose from "mongoose";

class SupplierDasboardService {
  private supplierDashboard: SupplierDashboardRepo;

  constructor() {
    this.supplierDashboard = new SupplierDashboardRepo();
  }

  public async getTotalPOData(req: Request, res: Response) {
    try {
      const supplierId = new mongoose.Types.ObjectId(req.user?.supplier);
      console.log("supplier id is ", supplierId);
      console.log("Type of supplierId:", typeof supplierId);
      const totalPOData =
        await this.supplierDashboard.getTotalPOData(supplierId);
      const result = {
        totalPOData: totalPOData,
      };

      return res.sendFormatted(
        result,
        "supplier analytics fetched successfully",
        200,
      );
    } catch (error) {
      console.log("erorr getting total PO data");
      return res.sendError("error", "error", 500);
    }
  }
}

export default SupplierDasboardService;
