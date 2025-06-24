import rawMaterial from "../models/rawMaterial";
import underProcessModel from "../models/underProcessModel";
import underSpecialProcessModel from "../models/underSpecialProcessModel";
import finalInspection from "../models/finalInspection";
import { rawMaterialInterface } from "../../interfaces/rawMaterialInterface";

class ProgressUpdateRepo {

    constructor() { }

    //RAW mateial progress update
    public async createRawMaterial(rawMaterialData: rawMaterialInterface) {
        return await rawMaterial.create(rawMaterialData);
    }
    public async getRawMaterial() {

    }
    public async updateRawMaterial() {

    }
    public async deleteRawMaterial() {

    }

    //Under Process progress update
    public async createUnderProcess() {

    }
    public async getUnderProcess() {

    }
    public async updateUnderProcess() {

    }
    public async deleteUnderProcess() {

    }

    //under special process  progress update
    public async createUnderSpecialProcess() {

    }
    public async getUnderSpecialProcess() {

    }
    public async updateUnderSpecialProcess() {

    }
    public async deleteUnderSpecialProcess() {

    }
}

export default ProgressUpdateRepo