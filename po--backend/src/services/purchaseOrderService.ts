import { error } from "console";
import PurchaseOrderRepo from "../database/repositories/purchaseOrderRepo";
import { Request, Response } from "express";

class PurchaseOrderService {
  private poRepo: PurchaseOrderRepo;
  constructor() {
    this.poRepo = new PurchaseOrderRepo();
  }
  public async createPo(req: Request, res: Response) {
    try {
      const { po }: any = req.body;
      const poObject = await this.poRepo.createPurchaseOrder(po);
      return res.sendFormatted(poObject, "Purchase Order Object Created", 200);
    } catch (error) {
      return res.sendError(
        "Error while creating po",
        "Error while creating po",
        400,
      );
    }
  }

  //Repo call to delete the PO by id
  public async deletePOBYID(req: Request, res: Response) {
    try {
      //Fetching id form params
      const id: any = req.params.id

      if (!id) {
        return res.sendError("Id not found", "Id not found", 404);
      }

      const deletedPO = await this.poRepo.deletePurchaseOrderById(id);
      return res.sendFormatted(deletedPO, "PO deleted successfully", 200);
      
    } catch (error) {
      return res.sendError(
        error,
        "Error while deleteing po",
        400,
      );
    }

  }

  //Repo call to fetch all the POs
  public async getPO(req: Request, res: Response){
    try {
      const POs=await this.poRepo.getAllPO();
      return res.sendArrayFormatted(POs,"All POs fetched successfully",200)
    } catch (error) {
      res.sendError(error,"Error while getting PO",400)
    }
  }

  //Repo call to fetch the PO by id
  public async getPOById(req: Request, res: Response){
    try {
      const id:any= req.params.id;

      if(!id){
        return res.sendError("id not found","id not found",404)
      }

      const PO=await this.poRepo.getPOByID(id);
      return res.sendFormatted(PO,"PO fetched successfully",200);
    } catch (error) {
        res.sendError(error,"Error while fetching PO",400);
    }
  }
}

export default PurchaseOrderService;
