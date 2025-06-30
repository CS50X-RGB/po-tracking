import mongoose, { ObjectId } from "mongoose";
import PurchaseOrderModel from "../models/purchaseOrderModel";
import lineItemModel from "../models/lineItemModel";
import { Console } from "console";

class AdminDashboardRepo {
  constructor() {}

  //get PO total count
  public async getTotalPOCount() {
    try {
      const totalPOCount = await PurchaseOrderModel.countDocuments();
      return totalPOCount;
    } catch (error) {
      console.log("Error getting total count", error);
      throw new Error(`Erron in getting total PO Count`);
    }
  }

  //get total PO value
  public async getTotalPOValue() {
    try {
      const totalPOValue = await lineItemModel.aggregate([
        {
          $group: {
            _id: null,
            totalCost: {
              $sum: "$total_cost",
            },
          },
        },
      ]);
      const totalValue = totalPOValue[0]?.totalCost ?? 0;
      console.log("total PO value", { totalValue });
      return { totalValue };
    } catch (error) {
      console.log("Error getting total PO value", error);
      throw new Error(`Erron in getting total PO value`);
    }
  }

  //get open value
  public async getOpenPO() {
    try {
      const openPOAgg = await PurchaseOrderModel.aggregate([
        {
          $lookup: {
            from: "line_items",
            localField: "lineItem",
            foreignField: "_id",
            as: "lineItemDocs",
          },
        },
        { $unwind: "$lineItemDocs" },
        { $match: { "lineItemDocs.supplier_readliness_date": { $ne: null } } },
        {
          $group: {
            _id: null,
            openPOValue: { $sum: "$lineItemDocs.total_cost" },
            openCount: { $sum: 1 },
          },
        },
      ]);

      const openCount = openPOAgg[0]?.openCount ?? 0;
      const openPOValue = openPOAgg[0]?.openPOValue ?? 0;
      console.log({ openCount, openPOValue });
      return { openCount, openPOValue };
    } catch (error) {
      console.log("Error getting total open PO count", error);
      throw new Error(`Erron in getting total open PO Count`);
    }
  }
  //total line lineItem
  public async getlineItem() {
    try {
      const totalLineItem = await lineItemModel.countDocuments();
      console.log("total line item", totalLineItem);

      const openLineItem = await lineItemModel.countDocuments({
        supplier_readliness_date: { $ne: null },
      });
      console.log("open line item", openLineItem);

      return { totalLineItem, openLineItem };
    } catch (error) {
      console.log("Error getting total LI Data", error);
      throw new Error(`Erron in getting LI data`);
    }
  }
}

export default AdminDashboardRepo;
