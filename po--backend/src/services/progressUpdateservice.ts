import rawMaterial from "../database/models/rawMaterial";
import { rawMaterialInterface } from "../interfaces/rawMaterialInterface";
import { Request,Response } from "express";
import ProgressUpdateRepo from "../database/repositories/progressUpdateRepo";


class ProgressUpdateService{
    private progressUpdateRepo: ProgressUpdateRepo;

    constructor(){
        this.progressUpdateRepo=new ProgressUpdateRepo();
    }

    public async createRawMaterial(req:Request,res:Response){
        const{source,inStock,received,planDate,actualDate,RMstatus}=req.body
    }

}

export default ProgressUpdateService
