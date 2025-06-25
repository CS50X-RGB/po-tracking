import rawMaterial from "../models/rawMaterial";
import underProcessModel from "../models/underProcessModel";
import underSpecialProcessModel from "../models/underSpecialProcessModel";
import finalInspection from "../models/finalInspection";
import { rawMaterialInterface } from "../../interfaces/rawMaterialInterface";
import ProgressUpdateModel from "../models/progressUpdateModel";
import { underProcessInterface } from "../../interfaces/underProcessInterface";

class ProgressUpdateRepo {
  constructor() {}

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

  // Create Progress Update Entity By Line Item Id
  public async createProgressUpdate(data: { LI: string }) {
    try {
      return await ProgressUpdateModel.create(data);
    } catch (error) {
      console.error(error, "Error creating ProgressUpdate");
      throw new Error("Failed to create ProgressUpdate");
    }
  }

  //Create RAW mateial progress update
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
