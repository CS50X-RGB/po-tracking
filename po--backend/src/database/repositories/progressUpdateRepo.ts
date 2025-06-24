import rawMaterial from "../models/rawMaterial";
import underProcessModel from "../models/underProcessModel";
import underSpecialProcessModel from "../models/underSpecialProcessModel";
import finalInspection from "../models/finalInspection";
import { rawMaterialInterface } from "../../interfaces/rawMaterialInterface";
import ProgressUpdateModel from "../models/progressUpdateModel";

class ProgressUpdateRepo {
  constructor() {}

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
  // Create Progress Update Entity By Line Item Id
  public async createProgressUpdateLineItem() {}
  public async getRawMaterial() {}
  public async deleteRawMaterial() {}

  //Under Process progress update
  public async createUnderProcess() {}
  public async getUnderProcess() {}
  public async updateUnderProcess() {}
  public async deleteUnderProcess() {}

  //under special process  progress update
  public async createUnderSpecialProcess() {}
  public async getUnderSpecialProcess() {}
  public async updateUnderSpecialProcess() {}
  public async deleteUnderSpecialProcess() {}
}

export default ProgressUpdateRepo;
