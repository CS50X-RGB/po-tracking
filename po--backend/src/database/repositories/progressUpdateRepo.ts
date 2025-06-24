import rawMaterial from "../models/rawMaterial";
import underProcessModel from "../models/underProcessModel";
import underSpecialProcessModel from "../models/underSpecialProcessModel";
import finalInspection from "../models/finalInspection";
import { rawMaterialInterface } from "../../interfaces/rawMaterialInterface";

class ProgressUpdateRepo {
  constructor() {}

  //RAW mateial progress update
  public async createRawMaterial(rawMaterialData: rawMaterialInterface) {
    try {
      return await rawMaterial.create(rawMaterialData);
    } catch (error) {
      console.log(error, "error");
      throw new Error(`Error while creating raw material`);
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
