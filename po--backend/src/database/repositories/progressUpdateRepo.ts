import rawMaterial from "../models/rawMaterial";
import underProcessModel from "../models/underProcessModel";
import underSpecialProcessModel from "../models/underSpecialProcessModel";
import finalInspectionModel from "../models/finalInspection";
import { rawMaterialInterface } from "../../interfaces/rawMaterialInterface";
import ProgressUpdateModel from "../models/progressUpdateModel";
import { underProcessInterface } from "../../interfaces/underProcessInterface";
import { underSpecialProcessInterface } from "../../interfaces/underSpecialProcessInterface";
import { finalInspectionInterface } from "../../interfaces/finalInspection";

class ProgressUpdateRepo {
  constructor() {}

  //function to create a progress upate entiry for a line item
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

  //RAW mateial progress update
  public async createRawMaterial(
    id: any,
    rawMaterialData: rawMaterialInterface,
  ) {
    try {
      const rawMaterialObj = await rawMaterial.create(rawMaterialData);
      //Update ProgressUpdate to link this RawMaterial
      await ProgressUpdateModel.findByIdAndUpdate(id, {
        rawMaterial: rawMaterialObj._id,
      });
      return rawMaterialObj?.toObject();
    } catch (error) {
      console.log(error, "error");
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

  //Update RAW mateial progress update
  public async updateRawMaterial(
    rawMaterialId: string,
    data: Partial<rawMaterialInterface>,
  ) {
    try {
      return await rawMaterial.findByIdAndUpdate(rawMaterialId, data, {
        new: true,
      });
    } catch (error) {
      console.error(error, "Error updating Raw Material");
      throw new Error("Failed to update Raw Material");
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

  public async getAllProgressUpdate(supplierId: any, poId?: any) {
    try {
      const progressUpdates = await ProgressUpdateModel.find({
        supplier: supplierId,
      })
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
        .populate("supplier  rawMaterial underProcess finalInspection")
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
      return await underProcessModel.findByIdAndUpdate(underProcessId, data, {
        new: true,
      });
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

  //creae Final inspection
  public async createFinalInspection(
    id: any,
    finalInspectionData: finalInspectionInterface,
  ) {
    try {
      const finalInspection =
        await finalInspectionModel.create(finalInspectionData);
      //Update ProgressUpdate to link this underSpecialProcess
      await ProgressUpdateModel.findByIdAndUpdate(id, {
        finalInspection: finalInspection._id,
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
