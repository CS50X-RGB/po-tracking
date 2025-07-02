import mongoose, { ObjectId } from "mongoose";
import PurchaseOrderModel from "../models/purchaseOrderModel";
import progressUpdateModel from "../models/progressUpdateModel";
import lineItemModel from "../models/lineItemModel";

class SupplierDashboardRepo {
  constructor() {}

  public async getTotalPOData(supplierId: mongoose.Types.ObjectId) {
    try {
      const poDataAgg = await lineItemModel.aggregate([
        {
          $match: { supplier: supplierId },
        },
        {
          $group: {
            _id: "$purchaseOrder", // group by unique PO
            poTotalCost: { $sum: "$total_cost" },
          },
        },
        {
          $group: {
            _id: null,
            totalPOCount: { $sum: 1 },
            totalPOValue: { $sum: "$poTotalCost" },
          },
        },
      ]);

      const totalPOCount = poDataAgg[0]?.totalPOCount ?? 0;
      const totalPOValue = poDataAgg[0]?.totalPOValue ?? 0;
      console.log("Total PO count is ", totalPOCount);
      console.log("Total PO value is ", totalPOValue);
      return { totalPOCount, totalPOValue };
    } catch (error) {
      console.error("Error fetching supplier PO data", error);
      throw new Error("Error fetching supplier PO data");
    }
  }
}

export default SupplierDashboardRepo;
