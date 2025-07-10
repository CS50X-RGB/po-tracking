import rawMaterial, { RMtracker } from "../models/rawMaterial";
import underProcessModel from "../models/underProcessModel";
import CiplDocument from "../models/ciplModel";
import FeedBackTrackerModel from "../models/feedbackTrackerModel";
import underSpecialProcessModel from "../models/underSpecialProcessModel";
import finalInspectionModel, {
  inspectionTracker,
  isQualityCheckCompletedEnum,
} from "../models/finalInspection";
import {
  ciplInterface,
  rawMaterialInterface,
  wmsInterface,
} from "../../interfaces/rawMaterialInterface";
import ProgressUpdateModel, {
  DeliveryStatus,
  ProgressTrackerEnum,
} from "../models/progressUpdateModel";
import { underProcessInterface } from "../../interfaces/underProcessInterface";
import { underSpecialProcessInterface } from "../../interfaces/underSpecialProcessInterface";
import { finalInspectionInterface } from "../../interfaces/finalInspection";
import WmsModel from "../models/wmsModel";
import LineItemModel, { LineItemStatus } from "../models/lineItemModel";
import LogisticsRepo from "./logisticsRepo";

class ProgressUpdateRepo {
  private logisticsRepo: LogisticsRepo;
  constructor() {
    this.logisticsRepo = new LogisticsRepo();
  }
  public async createProgressUpdate(data: {
    LI: string;
    supplier: any;
    qty: any;
  }) {
    try {
      const newObj: any = {
        ...data,
        openqty: data.qty,
      };
      return await ProgressUpdateModel.create(newObj);
    } catch (error) {
      console.error(error, "Error creating ProgressUpdate");
      throw new Error("Failed to create ProgressUpdate");
    }
  }
  public async finalStatus(id: string, date_dispatched: any, status?: any) {
    try {
      const currentPU = await ProgressUpdateModel.findById(id).populate("LI");

      if (!currentPU) {
        throw new Error("Progress update not found");
      }

      const isFullyDispatched =
        Number(currentPU.qty) === Number(currentPU.dispatchedQty);

      const newStatus = isFullyDispatched
        ? DeliveryStatus.Dispatched
        : (status ?? currentPU.delivery_status);
      const lineItemTotalDispatched = Number(currentPU.dispatchedQty);
      const lineItem: any = await LineItemModel.findById(currentPU.LI);
      const increment = lineItemTotalDispatched * lineItem.unit_cost;
      console.log(status, "status");
      let lineItemStatus: LineItemStatus = "In Transit Full Qty";
      switch (status) {
        case DeliveryStatus.Shortclosed:
          lineItemStatus = "In Transit ShortClosed";
          break;
        case DeliveryStatus.PartiallyDispatched:
          lineItemStatus = "Partially Dispatched";
          break;
        default:
          lineItemStatus = "In Transit Full Qty";
          break;
      }
      console.log(lineItemStatus, "status");
      await LineItemModel.updateOne(
        { _id: currentPU.LI },
        {
          $inc: { value_delivered: increment },
          $set: { line_item_status: lineItemStatus },
        },
      );

      const updatedPU = await ProgressUpdateModel.findByIdAndUpdate(
        id,
        {
          dispatched_date: date_dispatched,
          delivery_status: newStatus,
          openqty: isFullyDispatched
            ? 0
            : Number(currentPU.qty) - Number(currentPU.dispatchedQty),
        },
        { new: true },
      );
      const createLogistics = await this.logisticsRepo.createLogistics(id);
      return updatedPU;
    } catch (error) {
      console.error("Error while updating final status:", error);
      throw new Error("Error while updating final status");
    }
  }

  //RAW mateial progress update
  public async createRawMaterial(
    id: any,
    rawMaterialData: rawMaterialInterface,
  ) {
    try {
      const progressUpdate: any = await ProgressUpdateModel.findById(
        id,
      ).populate({
        path: "LI",
        select: "exw_date purchaseOrder",
        populate: {
          path: "purchaseOrder",
          select: "order_date",
        },
      });
      let progressTracker = ProgressTrackerEnum.NOT_STARTED;
      if (progressUpdate) {
        const exwDate = progressUpdate?.LI?.exw_date;
        const orderDate = progressUpdate?.LI?.purchaseOrder?.order_date;
        const interval = Math.ceil(
          (exwDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        const interval60Percent = Math.round(0.6 * interval) + 1;
        console.log(interval60Percent, "Interval 60%");
        const thresholdDate = new Date(orderDate);
        thresholdDate.setDate(orderDate.getDate() + interval60Percent);
        console.log(thresholdDate, "Threshold Date");
        rawMaterialData.thresholdDate = thresholdDate;

        if (rawMaterialData.actualDate) {
          if (rawMaterialData.actualDate <= thresholdDate) {
            rawMaterialData.RMtracker = RMtracker.ON_TRACK;
            progressTracker = ProgressTrackerEnum.ON_TRACK;
          } else {
            rawMaterialData.RMtracker = RMtracker.DELAYED;
            progressTracker = ProgressTrackerEnum.DELAYED;
          }
        } else {
          const today = new Date();
          rawMaterialData.RMtracker =
            today > thresholdDate ? RMtracker.DELAYED : RMtracker.ON_TRACK;
          progressTracker =
            today > thresholdDate
              ? ProgressTrackerEnum.DELAYED
              : ProgressTrackerEnum.ON_TRACK;
        }
      }

      const rawMaterialObj = await rawMaterial.create(rawMaterialData);

      await ProgressUpdateModel.findByIdAndUpdate(id, {
        rawMaterial: rawMaterialObj._id,
        delivery_status: DeliveryStatus.InProgress,
        progressTracker: progressTracker,
      });

      return rawMaterialObj?.toObject();
    } catch (error) {
      console.error("Error:", error);
      throw new Error(`Error while creating raw material`);
    }
  }

  public async checkEntity(
    progressUpdateId: any,
    type: "RM" | "UP" | "USP" | "FI",
  ) {
    try {
      const progressUpdate =
        await ProgressUpdateModel.findById(progressUpdateId).lean();

      if (!progressUpdate) return null;

      switch (type) {
        case "RM":
          return progressUpdate.rawMaterial;
        case "UP":
          return progressUpdate.underProcess;
        case "USP":
          return progressUpdate.underSpecialProcess;
        case "FI":
          return progressUpdate.finalInspection;
        default:
          return null;
      }
    } catch (error) {
      throw new Error(
        `Error while getting entity: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  public async updateRawMaterial(
    rawMaterialId: string,
    data: Partial<rawMaterialInterface>,
  ) {
    try {
      const updatedRawMaterial = await rawMaterial.findByIdAndUpdate(
        rawMaterialId,
        data,
        { new: true },
      );

      if (!updatedRawMaterial) {
        throw new Error("Raw Material not found");
      }

      const progressUpdate: any = await ProgressUpdateModel.findOne({
        rawMaterial: rawMaterialId,
      }).populate({
        path: "LI",
        select: "exw_date purchaseOrder",
        populate: {
          path: "purchaseOrder",
          select: "order_date",
        },
      });
      let progressUpdateTracker = progressUpdate.progressTracker;
      if (
        progressUpdate?.delivery_status === DeliveryStatus.PartiallyDispatched
      ) {
        progressUpdate.$set("delivery_status", DeliveryStatus.InProgress);
        await progressUpdate.save();
      }
      if (
        progressUpdate &&
        progressUpdate.LI?.exw_date &&
        progressUpdate.LI?.purchaseOrder?.order_date
      ) {
        const exwDate = progressUpdate.LI.exw_date;
        const orderDate = progressUpdate.LI.purchaseOrder.order_date;

        const interval = Math.ceil(
          (exwDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        const interval60Percent = Math.round(0.6 * interval) + 1;

        const thresholdDate = new Date(orderDate);
        thresholdDate.setDate(orderDate.getDate() + interval60Percent);
        const updateData: Partial<rawMaterialInterface> = {
          thresholdDate,
        };
        if (updatedRawMaterial.actualDate) {
          updateData.RMtracker =
            updatedRawMaterial.actualDate <= thresholdDate
              ? RMtracker.ON_TRACK
              : RMtracker.DELAYED;
          progressUpdateTracker =
            updatedRawMaterial.actualDate <= thresholdDate
              ? ProgressTrackerEnum.ON_TRACK
              : ProgressTrackerEnum.DELAYED;
        } else {
          const today = new Date();
          updateData.RMtracker =
            today <= thresholdDate ? RMtracker.ON_TRACK : RMtracker.DELAYED;
          progressUpdateTracker =
            today <= thresholdDate
              ? ProgressTrackerEnum.ON_TRACK
              : ProgressTrackerEnum.DELAYED;
        }
        const fi: any = await this.checkEntity(progressUpdate._id, "FI");
        if (fi) {
          if (fi.inspectionTracker === inspectionTracker.DELAYED) {
            progressUpdateTracker = ProgressTrackerEnum.DELAYED;
          } else if (fi.inspectionTracker === inspectionTracker.ON_TRACK) {
            progressUpdateTracker = ProgressTrackerEnum.ON_TRACK;
          }
        }
        await rawMaterial.findByIdAndUpdate(rawMaterialId, updateData);
        await ProgressUpdateModel.findByIdAndUpdate(progressUpdate._id, {
          progressTracker: progressUpdateTracker,
        });
      }

      return await rawMaterial.findById(rawMaterialId);
    } catch (error) {
      console.error(error, "Error updating Raw Material");
      throw new Error("Failed to update Raw Material");
    }
  }

  public async createCipl(
    id: any,
    dispatchedQty: number,
    ciplDocument: ciplInterface,
  ) {
    try {
      const newCipl = await CiplDocument.create(ciplDocument);
      const newProgressUpdate = await ProgressUpdateModel.findOneAndUpdate(
        { _id: id },
        {
          dispatchedQty,
          cipl: newCipl?.toObject()._id,
          delivery_status: DeliveryStatus.ReadyAndPacked,
        },
        { new: true },
      ).lean();
      return newProgressUpdate;
    } catch (error) {
      throw new Error(`Error while updating Progress Updating`);
    }
  }

  public async updateStatus(id: any, status: DeliveryStatus) {
    try {
      const update_qd_approve = await ProgressUpdateModel.findByIdAndUpdate(
        id,
        {
          delivery_status: status,
        },
        { new: true },
      );
      return update_qd_approve;
    } catch (error) {
      throw new Error("Error while updating qd approved");
    }
  }

  public async getItemsByStatus(status: DeliveryStatus | DeliveryStatus[]) {
    try {
      const query = Array.isArray(status)
        ? { delivery_status: { $in: status } }
        : { delivery_status: status };
      console.log(query, "query");
      const items_by_status = await ProgressUpdateModel.find(query)
        .populate({
          path: "LI",
          populate: [
            { path: "partNumber" },
            { path: "uom" },
            {
              path: "purchaseOrder",
              populate: [
                {
                  path: "client",
                },
                {
                  path: "client_branch",
                },
                {
                  path: "freight_term",
                },
                {
                  path: "payment_term",
                },
              ],
            },
          ],
        })
        .populate(
          "supplier  rawMaterial underProcess underSpecialProcess finalInspection cipl wms",
        )
        .lean();
      // Group progress updates by purchase order ID
      const groupedByPO: Record<string, any> = {};
      const ans: any[] = [];
      //Iterating through every progressUpdate in the original flat array.
      let purchaseOrder: any;
      for (const update of items_by_status) {
        //Grabs the purchaseOrder from the line item in the update.
        if ("purchaseOrder" in (update.LI || {})) {
          purchaseOrder = (update.LI as any).purchaseOrder;
        }
        //Skips the update if there's no purchase order.
        if (!purchaseOrder) continue;

        //Gets the unique purchase order ID as a string
        const poId = purchaseOrder._id.toString();

        //If this PO hasn’t been added yet to groupedByPO, create a new entry with:
        if (!groupedByPO[poId]) {
          groupedByPO[poId] = {
            purchaseOrder,
            progressUpdates: [],
          };
        }

        //Add the current progress update to the progressUpdates array under the right PO.

        groupedByPO[poId].progressUpdates.push(update);
      }
      for (const [poId, group] of Object.entries(groupedByPO)) {
        ans.push({
          poId,
          ...group,
        });
      }
      return ans;
    } catch (error) {
      throw new Error(`Error while getting Progress Update Items`);
    }
  }
  //Create underProcess progress update
  public async createUnderProcess(
    id: any,
    underProcessData: underProcessInterface,
  ) {
    try {
      const underProcessObj = await underProcessModel.create(underProcessData);
      //Update ProgressUpdate to link this underProcess
      await ProgressUpdateModel.findByIdAndUpdate(id, {
        underProcess: underProcessObj._id,
      });
      return underProcessObj?.toObject();
    } catch (error) {
      console.log(error, "error");
      throw new Error(`Error while creating under Process Object`);
    }
  }

  public async getUnderSpecialProcess() {}
  public async deleteUnderSpecialProcess() {}

  public async getAllProgressUpdate(
    status?: any,
    supplierId?: any,
    poId?: any,
  ) {
    try {
      let filter: any = {};
      if (supplierId) {
        filter.supplier = supplierId;
      }
      if (status) {
        filter.delivery_status = status;
      }
      console.log(filter, "filter");
      const progressUpdates = await ProgressUpdateModel.find(filter)
        .populate({
          path: "LI",
          populate: [
            { path: "partNumber" },
            { path: "uom" },
            {
              path: "purchaseOrder",
              populate: [
                {
                  path: "client",
                },
                {
                  path: "client_branch",
                },
                {
                  path: "freight_term",
                },
                {
                  path: "payment_term",
                },
              ],
            },
          ],
        })
        .populate(
          "supplier  rawMaterial underProcess underSpecialProcess finalInspection cipl feed_back_tracker",
        )

        .lean();

      // Group progress updates by purchase order ID
      const groupedByPO: Record<string, any> = {};
      const ans: any[] = [];
      //Iterating through every progressUpdate in the original flat array.
      let purchaseOrder: any;
      for (const update of progressUpdates) {
        //Grabs the purchaseOrder from the line item in the update.
        if ("purchaseOrder" in (update.LI || {})) {
          purchaseOrder = (update.LI as any).purchaseOrder;
        }
        if (!purchaseOrder) continue;
        const poId = purchaseOrder._id.toString();
        if (!groupedByPO[poId]) {
          groupedByPO[poId] = {
            purchaseOrder,
            progressUpdates: [],
          };
        }
        groupedByPO[poId].progressUpdates.push(update);
      }
      if (poId) {
        return groupedByPO[poId.toString()];
      }
      for (const [poId, group] of Object.entries(groupedByPO)) {
        ans.push({
          poId,
          ...group,
        });
      }
      //At the end, return just the values (i.e., the grouped array):
      return ans;
    } catch (error) {
      throw new Error(`Error while getting Progress Update Modals`);
    }
  }

  //Update underProcess progress update
  public async updateUnderProcess(
    underProcessId: string,
    data: Partial<underProcessInterface>,
  ) {
    try {
      const updateProcess = await underProcessModel.findByIdAndUpdate(
        underProcessId,
        data,
        {
          new: true, // returns the updated document
        },
      );
      return updateProcess;
    } catch (error) {
      console.error(error, "Error updating underProcess");
      throw new Error("Failed to update underProcess");
    }
  }

  //get open quantity
  public async getQtyInfo(progressUpdateId: any) {
    try {
      const openqty =
        await ProgressUpdateModel.findById(progressUpdateId).select(
          "openqty qty",
        );

      return openqty;
    } catch (error) {
      console.error(error, "Error getting open quantity");
      throw new Error("Failed to get openqty");
    }
  }
  //update quantity
  public async updateQuantity(progressUpdateId: any, quantity: number) {
    try {
      const openqty = await ProgressUpdateModel.findByIdAndUpdate(
        progressUpdateId,
        {
          openqty: quantity,
        },
      );

      return openqty;
    } catch (error) {
      console.error(error, "Error updating open qunatity");
      throw new Error("Failed to update open qunatity");
    }
  }

  //creae under special Process
  public async createUnderSpecialProcess(
    id: any,
    underSpecialProcessData: underSpecialProcessInterface,
  ) {
    try {
      const underSpecialProcess = await underSpecialProcessModel.create(
        underSpecialProcessData,
      );
      //Update ProgressUpdate to link this underSpecialProcess
      await ProgressUpdateModel.findByIdAndUpdate(id, {
        underSpecialProcess: underSpecialProcess._id,
      });
      return underSpecialProcess?.toObject();
    } catch (error) {
      console.log(error, "error");
      throw new Error(`Error while creating under Special Process Object`);
    }
  }

  //Update underProcess progress update
  public async updateUnderSpecialProcess(
    underSpecialProcessId: string,
    data: Partial<underSpecialProcessInterface>,
  ) {
    try {
      return await underSpecialProcessModel.findByIdAndUpdate(
        underSpecialProcessId,
        data,
        {
          new: true,
        },
      );
    } catch (error) {
      console.error(error, "Error updating underProcess");
      throw new Error("Failed to update underProcess");
    }
  }
  public async createWMS(id: any, wms: wmsInterface) {
    try {
      const newWMS = await WmsModel.create(wms);
      console.log(id, wms, "in function repo");
      await ProgressUpdateModel.findByIdAndUpdate(
        id,
        {
          $set: {
            wms: newWMS._id,
          },
          delivery_status: DeliveryStatus.ClearedForShipping,
        },
        {
          new: true, // If found and currently InProgress, update to ReadyAndPacked
        },
      );

      // 3. Return the newly created WMS object
      return newWMS.toObject();
    } catch (error) {
      throw new Error(`Error while creating WMS: ${error}`);
    }
  }

  public async updateDeliveryDefer(
    id: any,
    tentative_planned_date: any,
    status: DeliveryStatus,
  ) {
    try {
      const progressUpdate = await ProgressUpdateModel.findByIdAndUpdate(
        id,
        {
          tentative_planned_date,
          delivery_status: status,
        },
        {
          new: true,
        },
      ).lean();
      return progressUpdate;
    } catch (error) {
      throw new Error(`Error while updating progress Update`);
    }
  }
  //creae Final inspection
  public async createFinalInspection(
    id: any,
    finalInspectionData: finalInspectionInterface,
  ) {
    try {
      const progressUpdate: any = await ProgressUpdateModel.findById(
        id,
      ).populate({
        path: "LI",
        select: "exw_date purchaseOrder",
        populate: {
          path: "purchaseOrder",
          select: "order_date",
        },
      });
      let progressUpdateStatus = progressUpdate.progressTracker;
      if (progressUpdate) {
        let progressUpdateStatus = progressUpdate.progressTracker;
        const exwDate = progressUpdate?.LI?.exw_date;
        if (exwDate instanceof Date && !isNaN(exwDate.getTime())) {
          const inspectionDate = new Date(exwDate);
          inspectionDate.setDate(exwDate.getDate() - 1);
          finalInspectionData.inspectionThreshHoldDate = inspectionDate;
        }
        if (
          finalInspectionData.QDLink &&
          finalInspectionData.isQualityCheckCompleted ==
            isQualityCheckCompletedEnum.YES
        ) {
          if (new Date() <= finalInspectionData.inspectionThreshHoldDate) {
            finalInspectionData.inspectionTracker = inspectionTracker.ON_TRACK;
            progressUpdateStatus = ProgressTrackerEnum.ON_TRACK;
          } else if (
            new Date() > finalInspectionData.inspectionThreshHoldDate
          ) {
            finalInspectionData.inspectionTracker = inspectionTracker.DELAYED;
            progressUpdateStatus = ProgressTrackerEnum.DELAYED;
          }
        }
      }
      const finalInspection =
        await finalInspectionModel.create(finalInspectionData);
      await ProgressUpdateModel.findByIdAndUpdate(id, {
        finalInspection: finalInspection._id,
        delivery_status: DeliveryStatus.ReadyForInspection,
        progressTracker: progressUpdateStatus,
      });
      return finalInspection?.toObject();
    } catch (error) {
      console.log(error, "error");
      throw new Error(`Error while creating Final InspectionObject`);
    }
  }

  //Update final progress update
  public async updateFinalInspection(
    finalInspectionId: string,
    data: Partial<finalInspectionInterface>,
  ) {
    try {
      const progressUpdate: any = await ProgressUpdateModel.findOne({
        finalInspection: finalInspectionId,
      });
      const finalInspectionData: any =
        await finalInspectionModel.findById(finalInspectionId);
      let progressUpdateStatus = progressUpdate.progressTracker;
      if (
        finalInspectionData.QDLink &&
        finalInspectionData.isQualityCheckCompleted ==
          isQualityCheckCompletedEnum.YES
      ) {
        if (new Date() <= finalInspectionData.inspectionThreshHoldDate) {
          finalInspectionData.inspectionTracker = inspectionTracker.ON_TRACK;
          progressUpdateStatus = ProgressTrackerEnum.ON_TRACK;
        } else if (new Date() > finalInspectionData.inspectionThreshHoldDate) {
          finalInspectionData.inspectionTracker = inspectionTracker.DELAYED;
          progressUpdateStatus = ProgressTrackerEnum.DELAYED;
        }
      }
      progressUpdate.progressTracker = progressUpdateStatus;

      if (
        progressUpdate &&
        progressUpdate.delivery_status === DeliveryStatus.InProgress
      ) {
        progressUpdate.delivery_status = DeliveryStatus.ReadyAndPacked;
      }
      await progressUpdate.save();
      return await finalInspectionModel.findByIdAndUpdate(
        finalInspectionId,
        data,
        {
          new: true,
        },
      );
    } catch (error) {
      console.error(error, "Error updating Final Inspection");
      throw new Error("Failed to update Final Inspection");
    }
  }
  public async getProgressUpdateByLineItem(liId: any) {
    try {
      return await ProgressUpdateModel.findOne({
        LI: liId,
      });
    } catch (error: any) {
      throw new Error(error);
    }
  }

  public async createFeedBackByClient(
    id: any,
    data: any,
    userId: any,
    client: any,
  ) {
    try {
      const progressUpdateModal: any =
        await ProgressUpdateModel.findById(id).populate("LI");
      console.log(progressUpdateModal, "Modal");
      const lineItemRef = progressUpdateModal.LI;

      if (!lineItemRef)
        throw new Error("LineItem reference not found in progress update");

      const feedBackObj: any = {
        line_item: id,
        creadted_by: userId,
        prev_line_item_status: lineItemRef.line_item_status,
        prev_supplier_readliness_date: lineItemRef.supplier_readliness_date,
        prev_exw_date: lineItemRef.exw_date,
        prev_date_required_date: lineItemRef.date_required,
        supplier: lineItemRef.supplier,
        client,
      };

      const updatePU: any = {};
      const updateLI: any = {};

      if (data.status) {
        feedBackObj.new_line_item_status = data.status;

        // if (
        //   ["On Hold", "Deffered", "Cancelled", "Preponed"].includes(data.status)
        // ) {
        //   updatePU.status = data.status;
        updateLI.line_item_status = data.status;
        // }
      }
      if (data.date_required) {
        feedBackObj.new_date_required_date = data.date_required;

        const previous_date_required = feedBackObj.prev_date_required_date;
        const new_date_required = new Date(data.date_required);
        console.log(new_date_required, "New Date Required");
        const prev_exw_date = feedBackObj.prev_exw_date;
        console.log(previous_date_required, "Previos Date Required");
        console.log(prev_exw_date, "Previous EXW Date");
        const diffInMs =
          new_date_required.getTime() - previous_date_required.getTime();
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        const updated_exw_date = new Date(prev_exw_date);
        updated_exw_date.setDate(updated_exw_date.getDate() + diffInDays);
        console.log(updated_exw_date, "Updated EXW");
        feedBackObj.new_exw_date = updated_exw_date;
        // updateLI.exw_date = updated_exw_date;
        // updateLI.date_required = new_date_required;
      }

      if (data.supplier_readliness_date) {
        feedBackObj.new_supplier_readliness_date =
          data.supplier_readliness_date;
        const previous_exw_date = feedBackObj.prev_exw_date;
        const previous_date_required = feedBackObj.prev_date_required_date;

        if (previous_exw_date && previous_date_required) {
          const diffMs =
            previous_date_required.getTime() - previous_exw_date.getTime();
          const diffInDays = diffMs / (1000 * 60 * 60 * 24);

          const new_date_required = new Date(data.supplier_readliness_date);
          new_date_required.setDate(new_date_required.getTime() + diffInDays);

          feedBackObj.new_date_required = new_date_required;
        }
        // updateLI.supplier_readliness_date = data.supplier_readliness_date;
      }

      const createdFeed = await FeedBackTrackerModel.create(feedBackObj);

      if (createdFeed) {
        updatePU.$push = {
          feed_back_tracker: createdFeed._id,
        };
      }

      await ProgressUpdateModel.findByIdAndUpdate(id, updatePU, { new: true });
      await LineItemModel.findByIdAndUpdate(
        lineItemRef._id,
        { updateLI },
        { new: true },
      );
    } catch (error) {
      console.error(error);
      throw new Error(`Error while creating FeedBackTracker by client`);
    }
  }

  public async approveFeedBack(feedbackId: any, data: any, userId: any) {
    try {
      const feedbackEntity: any = await FeedBackTrackerModel.findById(
        feedbackId,
      ).populate([
        {
          path: "line_item",
          populate: [
            {
              path: "LI",
              populate: [
                {
                  path: "purchaseOrder",
                },
              ],
            },
          ],
        },
      ]);
      if (data.response === "Yes" && feedbackEntity) {
        const line_item = feedbackEntity.line_item?.LI;
        const progressUpdate = feedbackEntity.line_item._id;
        const purchaseOrder = feedbackEntity.line_item.LI.purchaseOrder;
        const update: any = {};
        const updatePU: any = {};
        if (feedbackEntity.new_line_item_status) {
          update.line_item_status = feedbackEntity.new_line_item_status;
          updatePU.delivery_status = feedbackEntity.new_line_item_status;
        }
        if (feedbackEntity.new_date_required) {
          update.date_required = feedbackEntity.new_date_required;
        }
        if (feedbackEntity.new_exw_date) {
          const rm = await this.checkEntity(progressUpdate, "RM");
          if (rm) {
            const order_date = purchaseOrder.order_date;
            const exw_date = feedbackEntity.new_exw_date;
            const interval = Math.ceil(
              (exw_date.getTime() - order_date.getTime()) /
                (1000 * 60 * 60 * 24),
            );
            const new_threshold_date = new Date(order_date);
            new_threshold_date.setDate(
              order_date.getDate() + Math.round(interval * 0.6) + 1,
            );
            const rmObject: any = await rawMaterial.findById(rm);
            const updatedRM: any = {
              thresholdDate: new_threshold_date,
            };
            if (rmObject) {
              if (rmObject.actualDate) {
                updatedRM.RMtracker =
                  rmObject.actualDate <= new_threshold_date
                    ? "on-track"
                    : "delayed";
              } else {
                const today = new Date();
                updatedRM.RMtracker =
                  today <= new_threshold_date ? "on-track" : "delayed";
              }
              await rawMaterial.findByIdAndUpdate(rm, updatedRM);
            }
          }
          const fi = await this.checkEntity(progressUpdate, "FI");
          if (fi) {
            const fiObject = await finalInspectionModel.findById(fi);
            const new_inspectionThresHoldDate = new Date(
              feedbackEntity.new_exw_date,
            );
            new_inspectionThresHoldDate.setDate(
              new_inspectionThresHoldDate.getDate() - 1,
            );

            const updateFi: any = {
              inspectionThreshHoldDate: new_inspectionThresHoldDate,
            };
            if (fiObject) {
              if (
                fiObject.QDLink &&
                fiObject.isQualityCheckCompleted ==
                  isQualityCheckCompletedEnum.YES
              ) {
                if (new Date() <= new_inspectionThresHoldDate) {
                  updateFi.inspectionTracker = inspectionTracker.ON_TRACK;
                } else if (new Date() > new_inspectionThresHoldDate) {
                  updateFi.inspectionTracker = inspectionTracker.DELAYED;
                }
              }
              await finalInspectionModel.findByIdAndUpdate(fi, updateFi);
            }
          }
          update.exw_date = feedbackEntity.new_exw_date;
        }
        console.log("update", update, updatePU);
        if (feedbackEntity.new_supplier_readliness_date) {
          update.supplier_readliness_date =
            feedbackEntity.new_supplier_readliness_date;
        }
        if (line_item.line_item_status === "Pending LI Change Approval") {
          update.line_item_status = "Active";
        }
        const lineItemEntity = await LineItemModel.findByIdAndUpdate(
          line_item,
          update,
          {
            new: true,
          },
        );
        console.log(lineItemEntity, "lineItem");
        const progressUpdateEntity =
          await ProgressUpdateModel.findByIdAndUpdate(
            progressUpdate,
            updatePU,
            {
              new: true,
            },
          );
        feedbackEntity.set("response", data.response);
        feedbackEntity.set("approved_by", userId);
      } else if (data.response === "No" && feedbackEntity) {
        feedbackEntity.set("response", data.response);
        feedbackEntity.set("approved_by", userId);
      }
      await feedbackEntity.save();
      return feedbackEntity;
    } catch (error) {
      throw new Error(`Error approving feedback object`);
    }
  }

  public async getFeedBacksForSupplier(supplier: any, page: any, offset: any) {
    try {
      let filter: any = {
        supplier,
        response: { $in: [null, undefined] },
        new_line_item_status: {
          $ne: "Pending LI Change Approval",
        },
      };

      const feedbackEntity = await FeedBackTrackerModel.find(filter)
        .populate([
          {
            path: "line_item",
            populate: [
              {
                path: "LI",
                populate: [
                  {
                    path: "partNumber",
                  },
                  {
                    path: "uom",
                  },
                  {
                    path: "supplier",
                  },
                ],
              },
            ],
          },
        ])
        .skip((page - 1) * offset)
        .limit(offset);
      const count = await FeedBackTrackerModel.find(filter).countDocuments();
      return {
        data: feedbackEntity,
        total: count,
      };
    } catch (error) {
      throw new Error(`Error while getting feedback tracker modal`);
    }
  }
  public async getFeedBacksForClient(client: any, page: any, offset: any) {
    try {
      let filter: any = {
        client,
        response: { $in: [null, undefined] },
        new_line_item_status: "Pending LI Change Approval",
      };

      const feedbackEntity = await FeedBackTrackerModel.find(filter)
        .populate([
          {
            path: "line_item",
            populate: [
              {
                path: "LI",
                populate: [
                  {
                    path: "partNumber",
                  },
                  {
                    path: "uom",
                  },
                  {
                    path: "supplier",
                  },
                ],
              },
            ],
          },
        ])
        .skip((page - 1) * offset)
        .limit(offset);
      const count = await FeedBackTrackerModel.find(filter).countDocuments();
      return {
        data: feedbackEntity,
        total: count,
      };
    } catch (error) {
      throw new Error(`Error while getting feedback tracker modal`);
    }
  }
}

export default ProgressUpdateRepo;
