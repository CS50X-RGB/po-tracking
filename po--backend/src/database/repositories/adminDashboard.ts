import mongoose, { ObjectId } from "mongoose";
import PurchaseOrderModel from "../models/purchaseOrderModel";
import progressUpdateModel from "../models/progressUpdateModel";
import FeedbackTrackerModel from "../models/feedbackTrackerModel";
import lineItemModel from "../models/lineItemModel";
import DeliveryStatus from "../models/progressUpdateModel";

class AdminDashboardRepo {
  constructor() {}

  //get PO total count
  public async getTotalPOCount(clientId?: mongoose.Types.ObjectId) {
    try {
      const filter: any = {};
      if (clientId) {
        filter.client = clientId;
      }
      const totalPOCount = await PurchaseOrderModel.countDocuments(filter);
      return totalPOCount;
    } catch (error) {
      console.log("Error getting total count", error);
      throw new Error(`Error in getting total PO Count`);
    }
  }

  public async getFeedBack(supplier?: any) {
    try {
      const filter: any = {
        response: { $in: [null, undefined] },
      };

      if (supplier) {
        filter["supplier"] = supplier;
      }

      const getFeedBack =
        await FeedbackTrackerModel.find(filter).countDocuments();
      return getFeedBack;
    } catch (error: any) {
      throw new Error(`Error while getting feedback: ${error}`);
    }
  }

  //get total PO value
  public async getTotalPOValue(clientId?: mongoose.Types.ObjectId) {
    try {
      const pipeline = [];

      if (clientId) {
        pipeline.push(
          {
            $lookup: {
              from: "pos",
              localField: "purchaseOrder",
              foreignField: "_id",
              as: "poDoc",
            },
          },
          { $unwind: "$poDoc" },
          {
            $match: { "poDoc.client": clientId },
          },
        );
      }
      pipeline.push({
        $group: {
          _id: null,
          totalCost: {
            $sum: "$total_cost",
          },
        },
      });

      const totalPOValue = await lineItemModel.aggregate(pipeline);
      const totalValue = totalPOValue[0]?.totalCost ?? 0;
      console.log("total PO value", { totalValue });
      return { totalValue };
    } catch (error) {
      console.log("Error getting total PO value", error);
      throw new Error(`Erron in getting total PO value`);
    }
  }

  //get open value
  public async getOpenPO(
    supplierId?: mongoose.Types.ObjectId,
    clientId?: mongoose.Types.ObjectId,
  ) {
    try {
      const matchStage: any = {
        "lineItemDocs.supplier_readliness_date": { $ne: null },
      };

      if (supplierId) {
        matchStage["lineItemDocs.supplier"] = supplierId;
      }
      if (clientId) {
        matchStage["client"] = clientId;
      }

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
        { $match: matchStage },
        {
          $group: {
            _id: "$_id", // Unique PO
            poTotal: { $sum: "$lineItemDocs.total_cost" },
          },
        },
        {
          $group: {
            _id: null,
            totalOpenPOValue: { $sum: "$poTotal" },
            openCount: { $sum: 1 }, // Count of unique POs
          },
        },
      ]);

      const openCount = openPOAgg[0]?.openCount ?? 0;
      const openPOValue = openPOAgg[0]?.totalOpenPOValue ?? 0;

      console.log({ openCount, openPOValue });

      return { openCount, openPOValue };
    } catch (error) {
      console.error("Error getting total open PO count", error);
      throw new Error(`Error in getting total open PO Count`);
    }
  }

  //total line lineItem
  public async getlineItem(
    supplierId?: mongoose.Types.ObjectId,
    clientId?: mongoose.Types.ObjectId,
  ) {
    try {
      const pipeline: any[] = [];

      if (clientId) {
        pipeline.push(
          {
            $lookup: {
              from: "pos",
              localField: "purchaseOrder",
              foreignField: "_id",
              as: "poDoc",
            },
          },
          { $unwind: "$poDoc" },
          { $match: { "poDoc.client": clientId } },
        );
      }

      if (supplierId) {
        pipeline.push({
          $match: { supplier: supplierId },
        });
      }

      // Count total line items
      pipeline.push({
        $count: "totalLineItem",
      });

      const totalLineItemAgg = await lineItemModel.aggregate(pipeline);

      const totalLineItem = totalLineItemAgg[0]?.totalLineItem ?? 0;
      console.log("total line item", totalLineItem);

      // For open line items, repeat pipeline on progressUpdateModel
      const pipeline2: any[] = [];

      if (clientId) {
        pipeline2.push(
          {
            $lookup: {
              from: "pos",
              localField: "purchaseOrder",
              foreignField: "_id",
              as: "poDoc",
            },
          },
          { $unwind: "$poDoc" },
          { $match: { "poDoc.client": clientId } },
        );
      }

      if (supplierId) {
        pipeline2.push({
          $match: { supplier: supplierId },
        });
      }

      pipeline2.push({
        $count: "openLineItem",
      });

      const openLineItemAgg = await progressUpdateModel.aggregate(pipeline2);

      const openLineItem = openLineItemAgg[0]?.openLineItem ?? 0;
      console.log("open line item", openLineItem);

      return { totalLineItem, openLineItem };
    } catch (error) {
      console.log("Error getting total LI Data", error);
      throw new Error(`Error in getting LI data`);
    }
  }

  //get Line Item Dispatched data

  public async getLIDispatchedData(
    supplierId?: mongoose.Types.ObjectId,
    clientId?: mongoose.Types.ObjectId,
  ) {
    try {
      const matchStage: any = {
        delivery_status: "Dispatched",
      };

      if (supplierId) {
        matchStage.supplier = supplierId;
      }

      const pipeline: any[] = [
        { $match: matchStage },
        {
          $lookup: {
            from: "line_items",
            localField: "LI",
            foreignField: "_id",
            as: "lineItemDocs",
          },
        },
        { $unwind: "$lineItemDocs" },
      ];

      if (clientId) {
        pipeline.push(
          {
            $lookup: {
              from: "pos",
              localField: "lineItemDocs.purchaseOrder",
              foreignField: "_id",
              as: "poDoc",
            },
          },
          { $unwind: "$poDoc" },
          { $match: { "poDoc.client": clientId } },
        );
      }

      // Count dispatched line items for this client
      const countAgg = await progressUpdateModel.aggregate([
        ...pipeline,
        { $count: "count" },
      ]);

      const count = countAgg[0]?.count ?? 0;

      // Sum dispatched LI value for this client
      const valueAgg = await progressUpdateModel.aggregate([
        ...pipeline,
        {
          $group: {
            _id: null,
            totalDispatchedValue: { $sum: "$lineItemDocs.total_cost" },
          },
        },
      ]);

      const value = valueAgg[0]?.totalDispatchedValue ?? 0;

      return { count, value };
    } catch (error) {
      console.error("Error getting total Dispatched LI Data", error);
      throw new Error(`Error in getting Dispatched LI Data`);
    }
  }

  public async getDeliveryStatusdata(supplier?: any, client?: any) {
    try {
      let filter: any = {
        delivery_status: {
          $in: [
            "AwaitingPickUp",
            "Ready and Packed",
            "Cancelled",
            "Ready for Inspection",
            "InProgress",
          ],
        },
      };
      if (supplier) {
        filter.supplier = supplier;
      }
      console.log(filter, "filter");
      const result = await progressUpdateModel.aggregate([
        {
          $match: {
            ...filter,
          },
        },
        {
          $group: {
            _id: "$delivery_status",
            count: { $sum: 1 },
          },
        },
      ]);
      const data = {
        awaitingPickup: 0,
        readyAndPacked: 0,
        cancelled: 0,
        readyForInspection: 0,
        inProgress: 0,
      };

      for (const item of result) {
        if (item._id === "AwaitingPickUp") data.awaitingPickup = item.count;
        if (item._id === "Ready and Packed") data.readyAndPacked = item.count;
        if (item._id === "Cancelled") data.cancelled = item.count;
        if (item._id === "Ready for Inspection")
          data.readyForInspection = item.count;

        if (item._id === "InProgress") data.inProgress = item.count;
      }

      return data;
    } catch (error) {
      console.error("Error in getDeliveryStatusdata", error);
      throw new Error("Failed to get delivery status data");
    }
  }
}

export default AdminDashboardRepo;
