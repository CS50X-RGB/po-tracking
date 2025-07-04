import rawMaterial, { RMtracker } from "../models/rawMaterial";
import underProcessModel from "../models/underProcessModel";
import CiplDocument from "../models/ciplModel";
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
} from "../models/progressUpdateModel";
import { underProcessInterface } from "../../interfaces/underProcessInterface";
import { underSpecialProcessInterface } from "../../interfaces/underSpecialProcessInterface";
import { finalInspectionInterface } from "../../interfaces/finalInspection";
import WmsModel from "../models/wmsModel";
import LineItemModel from "../models/lineItemModel";
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

      await LineItemModel.updateOne(
        { _id: currentPU.LI },
        { $inc: { value_delivered: increment } },
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
          } else {
            rawMaterialData.RMtracker = RMtracker.DELAYED;
          }
        } else {
          const today = new Date();
          rawMaterialData.RMtracker =
            today > thresholdDate ? RMtracker.DELAYED : RMtracker.ON_TRACK;
        }
      }

      const rawMaterialObj = await rawMaterial.create(rawMaterialData);

      await ProgressUpdateModel.findByIdAndUpdate(id, {
        rawMaterial: rawMaterialObj._id,
        delivery_status: DeliveryStatus.InProgress,
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
        } else {
          const today = new Date();
          updateData.RMtracker =
            today <= thresholdDate ? RMtracker.ON_TRACK : RMtracker.DELAYED;
        }
        await rawMaterial.findByIdAndUpdate(rawMaterialId, updateData);
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
          "supplier  rawMaterial underProcess underSpecialProcess finalInspection cipl",
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
      if (progressUpdate) {
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
          } else if (
            new Date() > finalInspectionData.inspectionThreshHoldDate
          ) {
            finalInspectionData.inspectionTracker = inspectionTracker.DELAYED;
          }
        }
      }
      const finalInspection =
        await finalInspectionModel.create(finalInspectionData);
      await ProgressUpdateModel.findByIdAndUpdate(id, {
        finalInspection: finalInspection._id,
        delivery_status: DeliveryStatus.ReadyForInspection,
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
      const progressUpdate = await ProgressUpdateModel.findOne({
        finalInspection: finalInspectionId,
      });

      if (
        progressUpdate &&
        progressUpdate.delivery_status === DeliveryStatus.InProgress
      ) {
        progressUpdate.delivery_status = DeliveryStatus.ReadyAndPacked;
        await progressUpdate.save();
      }
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
}

export default ProgressUpdateRepo;
