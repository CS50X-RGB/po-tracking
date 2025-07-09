import mongoose from "mongoose";
import { LineItemCreate } from "../../interfaces/lineItemInterface";
import LineItemModel from "../models/lineItemModel";
import progressUpdateModel from "../models/progressUpdateModel";
import ProgressUpdateRepo from "./progressUpdateRepo";

class LineItemRepo {
  private progresUpdateRepo: ProgressUpdateRepo;
  constructor() {
    this.progresUpdateRepo = new ProgressUpdateRepo();
  }

  public async createLineItem(lineItem: LineItemCreate) {
    try {
      const new_line = await LineItemModel.create(lineItem);
      return new_line?.toObject();
    } catch (error: any) {
      console.log(error, "Error");
      throw new Error(`Error while creating the line item: ${error.message}`);
    }
  }

  public async getNonAcceptedLineItem(poId: any, supplierId: any) {
    try {
      const allLineItems = await LineItemModel.find({
        purchaseOrder: poId,
        supplier: supplierId,
        supplier_readliness_date: { $in: [null, undefined] },
      })
        .populate("uom partNumber")
        .lean();
      return allLineItems;
    } catch (error) {
      throw new Error(`Error while getting All line Items`);
    }
  }

  public async accepteLineItem(
    id: string,
    supplier_readiness_date: Date,
    supplier: any,
    ssn?: string,
  ) {
    try {
      let filter: any = {
        supplier_readliness_date: supplier_readiness_date,
      };
      if (ssn) {
        filter.ssn = ssn;
      }
      const updatedLi: any = await LineItemModel.findByIdAndUpdate(id, filter, {
        new: true,
      }).lean();
      console.log(updatedLi, "Line item");
      if (!updatedLi) {
        throw new Error(`Line Item with ID ${id} not found`);
      }
      // Create Progress Update Entity by line item id
      const progressUpdate = await this.progresUpdateRepo.createProgressUpdate({
        LI: id,
        supplier,
        qty: updatedLi.qty,
      });

      return updatedLi;
    } catch (error) {
      console.error(error, "Error updating Line Item");
      throw new Error("Failed to update Line Item");
    }
  }

  //get all line items for admin
  public async getAllLineItems(
    page: number,
    offset: number,
    supplierId?: any,
    clientId?: any,
  ) {
    try {
      const filter: any = {};

      if (supplierId) {
        filter.supplier = supplierId;
      }
      const LIs = await LineItemModel.find(filter)
        .populate("partNumber")
        .populate("supplier")
        .populate("uom")
        .populate("purchaseOrder")
        .skip((page - 1) * offset)
        .limit(offset)
        .lean();
      const total = await LineItemModel.countDocuments(filter);
      return {
        data: LIs,
        total,
      };
    } catch (error) {
      throw new Error(`Error while getting the LIs`);
    }
  }

  //get open line Items
  public async getOpenLineItems(
    page: number,
    offset: number,
    supplierId?: any,
    clientId?: any,
  ) {
    try {
      const filter: any = {
        supplier_readliness_date: { $ne: null },
      };

      if (supplierId) {
        filter.supplier = supplierId;
      }
      const openLIs = await LineItemModel.find(filter)
        .populate("partNumber")
        .populate("supplier")
        .populate("uom")
        .populate("purchaseOrder")
        .skip((page - 1) * offset)
        .limit(offset)
        .lean();
      const total = await LineItemModel.countDocuments(filter);
      return {
        data: openLIs,
        total,
      };
    } catch (error) {
      throw new Error(`Error while getting the Open LIs`);
    }
  }

  public async changeSupplierReadlinessDate(
    supplier_readliness_date: any,
    liId: any,
    userId: any,
  ) {
    try {
      const updateLineItem: any = await LineItemModel.findByIdAndUpdate(
        liId,
        {
          $set: { supplier_readliness_date },
        },
        {
          new: true,
        },
      ).populate("purchaseOrder");
      if (updateLineItem) {
        const exw_date = updateLineItem?.exw_date;
        const supplier_readiness_date =
          updateLineItem?.supplier_readliness_date;
        const client = updateLineItem.purchaseOrder?.client;
        if (supplier_readiness_date >= exw_date) {
          const progressUpdateId: any =
            await this.progresUpdateRepo.getProgressUpdateByLineItem(liId);
          console.log(progressUpdateId, "progressUpdate");
          await this.progresUpdateRepo.createFeedBackByClient(
            progressUpdateId._id,
            {
              supplier_readliness_date,
              status: "Pending LI Change Approval",
            },
            userId,
            client,
          );
        }
      }
      return updateLineItem ? updateLineItem?.toObject() : null;
    } catch (error) {
      throw new Error(`Error while changing supplier readliness date`);
    }
  }

  //get dispatched line items
  public async getDispatchedLineItems(
    page: number,
    offset: number,
    supplierId?: mongoose.Types.ObjectId,
    clientId?: mongoose.Types.ObjectId,
  ) {
    try {
      const pipeline: any[] = [
        { $match: { delivery_status: "Dispatched" } },
        ...(supplierId ? [{ $match: { supplier: supplierId } }] : []),

        {
          $lookup: {
            from: "line_items",
            localField: "LI",
            foreignField: "_id",
            as: "lineItemDocs",
          },
        },
        { $unwind: "$lineItemDocs" },

        // Populate partNumber
        {
          $lookup: {
            from: "partnumbers",
            localField: "lineItemDocs.partNumber",
            foreignField: "_id",
            as: "lineItemDocs.partNumber",
          },
        },
        {
          $unwind: {
            path: "$lineItemDocs.partNumber",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Populate supplier
        {
          $lookup: {
            from: "suppliers",
            localField: "lineItemDocs.supplier",
            foreignField: "_id",
            as: "lineItemDocs.supplier",
          },
        },
        {
          $unwind: {
            path: "$lineItemDocs.supplier",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Populate uom
        {
          $lookup: {
            from: "unit_of_measurements",
            localField: "lineItemDocs.uom",
            foreignField: "_id",
            as: "lineItemDocs.uom",
          },
        },
        {
          $unwind: {
            path: "$lineItemDocs.uom",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Populate purchaseOrder
        {
          $lookup: {
            from: "pos",
            localField: "lineItemDocs.purchaseOrder",
            foreignField: "_id",
            as: "lineItemDocs.purchaseOrder",
          },
        },
        {
          $unwind: {
            path: "$lineItemDocs.purchaseOrder",
            preserveNullAndEmptyArrays: true,
          },
        },

        { $replaceRoot: { newRoot: "$lineItemDocs" } },

        { $skip: (page - 1) * offset },
        { $limit: offset },
      ];

      const dispatchedLiAgg = await progressUpdateModel.aggregate(pipeline);

      // Total Count Pipeline
      const countPipeline: any[] = [
        { $match: { delivery_status: "Dispatched" } },
        ...(supplierId ? [{ $match: { supplier: supplierId } }] : []),
        {
          $lookup: {
            from: "line_items",
            localField: "LI",
            foreignField: "_id",
            as: "lineItemDocs",
          },
        },
        { $unwind: "$lineItemDocs" },
        { $count: "total" },
      ];

      const totalCountAgg = await progressUpdateModel.aggregate(countPipeline);
      const total = totalCountAgg[0]?.total || 0;

      return {
        data: dispatchedLiAgg,
        total,
      };
    } catch (error) {
      throw new Error(`Error while fetching dispatched line items: ${error}`);
    }
  }
}

export default LineItemRepo;
