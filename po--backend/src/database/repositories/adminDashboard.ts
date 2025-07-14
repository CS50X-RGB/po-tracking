import mongoose, { ObjectId } from "mongoose";
import PurchaseOrderModel from "../models/purchaseOrderModel";
import progressUpdateModel from "../models/progressUpdateModel";
import FeedbackTrackerModel from "../models/feedbackTrackerModel";
import lineItemModel from "../models/lineItemModel";
import DeliveryStatus from "../models/progressUpdateModel";

class AdminDashboardRepo {
  constructor() {}

  //get PO total count
  public async getTotalPOCount(
    year?: number,
    clientId?: mongoose.Types.ObjectId,
    supplier?: any,
  ) {
    try {
      let totalPOCount = 0;

      if (!clientId && !supplier && !year) {
        console.log("condition 1: no filters");
        totalPOCount = await PurchaseOrderModel.countDocuments();
      } else if (clientId && !supplier && !year) {
        console.log("condition 2: only clientId");
        totalPOCount = await PurchaseOrderModel.countDocuments({
          client: clientId,
        });
      } else if (!clientId && supplier && !year) {
        console.log("condition 3: only supplier");
        const result = await lineItemModel.aggregate([
          { $match: { supplier: new mongoose.Types.ObjectId(supplier) } },
          { $group: { _id: "$purchaseOrder" } },
          { $count: "totalPOCount" },
        ]);
        totalPOCount = result[0]?.totalPOCount || 0;
      } else if (!clientId && !supplier && year) {
        console.log("condition 4: only year");
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
        const result = await lineItemModel.aggregate([
          { $match: { exw_date: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: "$purchaseOrder" } },
          { $count: "totalPOCount" },
        ]);
        totalPOCount = result[0]?.totalPOCount || 0;
      } else if (clientId && supplier && !year) {
        console.log("condition 5: clientId + supplier");
        const result = await lineItemModel.aggregate([
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
            $match: {
              supplier: new mongoose.Types.ObjectId(supplier),
              "poDoc.client": clientId,
            },
          },
          { $group: { _id: "$purchaseOrder" } },
          { $count: "totalPOCount" },
        ]);
        totalPOCount = result[0]?.totalPOCount || 0;
      } else if (clientId && !supplier && year) {
        console.log("condition 6: clientId + year");
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
        const result = await lineItemModel.aggregate([
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
            $match: {
              exw_date: { $gte: startDate, $lte: endDate },
              "poDoc.client": clientId,
            },
          },
          { $group: { _id: "$purchaseOrder" } },
          { $count: "totalPOCount" },
        ]);
        totalPOCount = result[0]?.totalPOCount || 0;
      } else if (!clientId && supplier && year) {
        console.log("condition 7: supplier + year");
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
        const result = await lineItemModel.aggregate([
          {
            $match: {
              supplier: new mongoose.Types.ObjectId(supplier),
              exw_date: { $gte: startDate, $lte: endDate },
            },
          },
          { $group: { _id: "$purchaseOrder" } },
          { $count: "totalPOCount" },
        ]);
        totalPOCount = result[0]?.totalPOCount || 0;
      } else if (clientId && supplier && year) {
        console.log("condition 8: clientId + supplier + year");
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
        const result = await lineItemModel.aggregate([
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
            $match: {
              supplier: new mongoose.Types.ObjectId(supplier),
              exw_date: { $gte: startDate, $lte: endDate },
              "poDoc.client": clientId,
            },
          },
          { $group: { _id: "$purchaseOrder" } },
          { $count: "totalPOCount" },
        ]);
        totalPOCount = result[0]?.totalPOCount || 0;
      }

      return totalPOCount;
    } catch (error) {
      console.error("❌ Error getting total PO count:", error);
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
  public async getTotalPOValue(
    year?: number,
    clientId?: mongoose.Types.ObjectId,
    supplier?: any,
  ) {
    try {
      const pipeline: any[] = [];

      const hasClient = !!clientId;
      const hasSupplier = !!supplier;
      const hasYear = !!year;

      // Case 8: All three present
      if (hasClient && hasSupplier && hasYear) {
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
        console.log("Condition 8: clientId + supplier + year");
        pipeline.push(
          {
            $match: {
              supplier: new mongoose.Types.ObjectId(supplier),
              exw_date: { $gte: startDate, $lte: endDate },
            },
          },
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

      // Case 6: clientId + year
      else if (hasClient && !hasSupplier && hasYear) {
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
        console.log("Condition 6: clientId + year");
        pipeline.push(
          {
            $match: {
              exw_date: { $gte: startDate, $lte: endDate },
            },
          },
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

      // Case 5: clientId + supplier
      else if (hasClient && hasSupplier && !hasYear) {
        console.log("Condition 5: clientId + supplier");
        pipeline.push(
          {
            $match: {
              supplier: new mongoose.Types.ObjectId(supplier),
            },
          },
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

      // Case 2: Only clientId
      else if (hasClient && !hasSupplier && !hasYear) {
        console.log("Condition 2: only clientId");
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

      // Case 7: supplier + year
      else if (!hasClient && hasSupplier && hasYear) {
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
        console.log("Condition 7: supplier + year");
        pipeline.push(
          {
            $match: {
              supplier: new mongoose.Types.ObjectId(supplier),
              exw_date: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $lookup: {
              from: "pos",
              localField: "purchaseOrder",
              foreignField: "_id",
              as: "poDoc",
            },
          },
          { $unwind: "$poDoc" },
        );
      }

      // Case 3: only supplier
      else if (!hasClient && hasSupplier && !hasYear) {
        console.log("Condition 3: only supplier");
        pipeline.push(
          {
            $match: {
              supplier: new mongoose.Types.ObjectId(supplier),
            },
          },
          {
            $lookup: {
              from: "pos",
              localField: "purchaseOrder",
              foreignField: "_id",
              as: "poDoc",
            },
          },
          { $unwind: "$poDoc" },
        );
      }

      // Case 4: only year
      else if (!hasClient && !hasSupplier && hasYear) {
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
        console.log("Condition 4: only year");
        pipeline.push(
          {
            $match: {
              exw_date: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $lookup: {
              from: "pos",
              localField: "purchaseOrder",
              foreignField: "_id",
              as: "poDoc",
            },
          },
          { $unwind: "$poDoc" },
        );
      }

      // Case 1: No filters
      else {
        console.log("Condition 1: no filters");
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
        );
      }

      // Final step: group and sum total_cost
      pipeline.push({
        $group: {
          _id: null,
          totalCost: { $sum: "$total_cost" },
        },
      });

      const totalPOValue = await lineItemModel.aggregate(pipeline);
      const totalValue = totalPOValue[0]?.totalCost ?? 0;

      return { totalValue };
    } catch (error) {
      console.error("❌ Error in getTotalPOValue", error);
      throw new Error(`Error in getting total PO value`);
    }
  }

  //get open value
  public async getOpenPO(
    year?: number,
    supplierId?: any,
    clientId?: mongoose.Types.ObjectId,
  ) {
    try {
      const matchStage: any = {
        "lineItemDocs.supplier_readliness_date": { $ne: null },
      };

      // Optional filters
      if (supplierId) {
        matchStage["lineItemDocs.supplier"] = new mongoose.Types.ObjectId(
          supplierId,
        );
      }

      if (clientId) {
        matchStage["client"] = clientId;
      }

      if (year) {
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
        matchStage["lineItemDocs.exw_date"] = {
          $gte: startDate,
          $lte: endDate,
        };
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
            openCount: { $sum: 1 },
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
    year?: number,
    supplierId?: any,
    clientId?: mongoose.Types.ObjectId,
  ) {
    try {
      const pipeline: any[] = [];
      console.log(year, supplierId, "supplier");
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
      if (year) {
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

        pipeline.push({
          $match: {
            exw_date: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        });
      }

      if (supplierId) {
        pipeline.push({
          $match: { supplier: new mongoose.Types.ObjectId(supplierId) },
        });
      }

      // Count total line items
      pipeline.push({
        $count: "totalLineItem",
      });

      const totalLineItemAgg = await lineItemModel.aggregate(pipeline);

      const totalLineItem = totalLineItemAgg[0]?.totalLineItem ?? 0;

      // For open line items, repeat pipeline on progressUpdateModel
      const pipeline2: any[] = [];

      if (clientId) {
        pipeline2.push(
          {
            $lookup: {
              from: "line_items",
              localField: "LI",
              foreignField: "_id",
              as: "liDoc",
            },
          },
          { $unwind: "$liDoc" },
          {
            $lookup: {
              from: "pos",
              localField: "liDoc.purchaseOrder",
              foreignField: "_id",
              as: "poDoc",
            },
          },
          { $unwind: "$poDoc" },
          {
            $match: {
              "poDoc.client": new mongoose.Types.ObjectId(clientId),
            },
          },
        );
      }

      if (supplierId) {
        pipeline2.push({
          $match: { supplier: new mongoose.Types.ObjectId(supplierId) },
        });
      }
      if (year) {
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

        pipeline2.push({
          $match: {
            exw_date: {
              $gte: startDate,
              $lte: endDate,
            },
          },
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
    year?: number,
    supplierId?: mongoose.Types.ObjectId,
    clientId?: mongoose.Types.ObjectId,
  ) {
    try {
      const matchStage: any = {
        delivery_status: "Dispatched",
      };

      if (supplierId) {
        matchStage.supplier = new mongoose.Types.ObjectId(supplierId);
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

      if (year) {
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
        pipeline.push({
          $match: {
            "lineItemDocs.exw_date": {
              $gte: startDate,
              $lte: endDate,
            },
          },
        });
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

  public async getDeliveryStatusdata(
    supplier?: any,
    client?: any,
    year?: number,
  ) {
    try {
      let baseMatch: any = {
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
        baseMatch.supplier = new mongoose.Types.ObjectId(supplier);
      }

      const pipeline: any[] = [{ $match: baseMatch }];

      // If client is provided, join with PO and match by client
      if (client) {
        pipeline.push(
          {
            $lookup: {
              from: "line_items",
              localField: "LI",
              foreignField: "_id",
              as: "lineItemDocs",
            },
          },
          { $unwind: "$lineItemDocs" },
          {
            $lookup: {
              from: "pos",
              localField: "lineItemDocs.purchaseOrder",
              foreignField: "_id",
              as: "poDoc",
            },
          },
          { $unwind: "$poDoc" },
          {
            $match: {
              "poDoc.client": new mongoose.Types.ObjectId(client),
            },
          },
        );
      }
      if (year) {
        pipeline.push(
          {
            $lookup: {
              from: "line_items",
              localField: "LI",
              foreignField: "_id",
              as: "lineItemDocs",
            },
          },
          { $unwind: "$lineItemDocs" },
          {
            $match: {
              "lineItemDocs.exw_date": {
                $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                $lte: new Date(`${year}-12-31T23:59:59.999Z`),
              },
            },
          },
        );
      }

      pipeline.push({
        $group: {
          _id: "$delivery_status",
          count: { $sum: 1 },
        },
      });

      const result = await progressUpdateModel.aggregate(pipeline);

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
      throw new Error("Failed to get delivered");
    }
  }

  public async getFullOtd(years: number[], supplier?: any, client?: any) {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const output: any = {};

      for (const year of years) {
        // const months = year === currentYear ? currentMonth : 12;
        const months = 12;
        const monthsOtd: Record<number, number> = {};

        for (let month = 1; month <= months; month++) {
          // Fix month for zero-based Date constructor
          const startDate = new Date(year, month - 1, 1);
          const endDate = new Date(year, month, 0);

          const progressUpdates = await progressUpdateModel
            .find()
            .populate({
              path: "LI",
              match: {
                exw_date: { $gte: startDate, $lte: endDate },
              },
              select: "exw_date",
              populate: {
                path: "purchaseOrder",
              },
            })
            .lean();

          const matched = progressUpdates.filter((p) => p.LI !== null);

          let dispatchedCount = matched.filter(
            (p) => p.delivery_status === "Dispatched",
          );

          if (supplier) {
            dispatchedCount = dispatchedCount.filter(
              (d) => d.supplier.toString() === supplier.toString(),
            );
          }

          if (client) {
            dispatchedCount = dispatchedCount.filter((d: any) => {
              return (
                d.LI?.purchaseOrder?.client?.toString() === client.toString()
              );
            });
          }

          const totalCount = matched.length;

          const otdPercentage =
            totalCount > 0
              ? Math.round((dispatchedCount.length / totalCount) * 100)
              : 0;

          monthsOtd[month] = otdPercentage;
        }
        let avgOtd = 0;
        if (supplier) {
          avgOtd = await this.getAvgOtd(year, supplier);
        } else {
          avgOtd = await this.getAvgOtd(year, null);
        }
        output[year] = {
          monthsOtd,
          avgOtd: avgOtd,
        };
      }

      return output;
    } catch (error: any) {
      throw new Error(`Failed to get Full Otd: ${error.message}`);
    }
  }

  public async getAvgOtd(
    year?: number,
    supplier?: any,
    client?: any,
  ): Promise<number> {
    try {
      const currentYear = new Date().getFullYear();
      const years = year
        ? [year]
        : [currentYear, currentYear - 1, currentYear - 2];
      let otdSum = 0;

      for (const selectedYear of years) {
        const jan1 = new Date(`${selectedYear}-01-01`);
        const isCurrentYear = selectedYear === currentYear;
        const endDate = isCurrentYear
          ? new Date(currentYear, new Date().getMonth() + 1, 0)
          : new Date(`${selectedYear}-12-31`);
        const progressUpdates = await progressUpdateModel
          .find()
          .populate({
            path: "LI",
            match: {
              exw_date: { $gte: jan1, $lte: endDate },
            },
            select: "exw_date",
            populate: {
              path: "purchaseOrder",
            },
          })
          .lean();

        const matched = progressUpdates.filter((p) => p.LI !== null);

        let dispatchedCount: any = matched.filter(
          (p) => p.delivery_status === "Dispatched",
        );

        if (client) {
          dispatchedCount = dispatchedCount.filter((d: any) => {
            return (
              d.LI?.purchaseOrder?.client?.toString() === client.toString()
            );
          });
        }

        if (supplier) {
          const supplierObjectId = new mongoose.Types.ObjectId(supplier);
          dispatchedCount = dispatchedCount.filter((d: any) =>
            d.supplier?.equals(supplierObjectId),
          );
        }

        const totalCount = matched.length;

        const otdPercentage =
          totalCount > 0
            ? Math.round((dispatchedCount.length / totalCount) * 100)
            : 0;

        otdSum += otdPercentage;
      }

      const finalAvg = otdSum / years.length;
      return Math.round(finalAvg);
    } catch (error: any) {
      throw new Error(`${error.message} during getAvgOtd`);
    }
  }
}

export default AdminDashboardRepo;
