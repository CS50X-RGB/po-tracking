import rawMaterial from "../models/rawMaterial";
import underProcessModel from "../models/underProcessModel";
import underSpecialProcessModel from "../models/underSpecialProcessModel";
import finalInspection from "../models/finalInspection";
import { rawMaterialInterface } from "../../interfaces/rawMaterialInterface";
import ProgressUpdateModel from "../models/progressUpdateModel";
import { underProcessInterface } from "../../interfaces/underProcessInterface";

class ProgressUpdateRepo {
  constructor() {}

  //function to create a progress upate entiry for a line item
  public async createProgressUpdate(data: { LI: string; supplier: any }) {
    try {
      return await ProgressUpdateModel.create(data);
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

  //under special process  progress update
  public async createUnderSpecialProcess() {}
  public async getUnderSpecialProcess() {}
  public async updateUnderSpecialProcess() {}
  public async deleteUnderSpecialProcess() {}

  public async getAllProgressUpdate(supplierId: any) {
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
        .populate("supplier")
        .lean();
      return progressUpdates;
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
}

export default ProgressUpdateRepo;
