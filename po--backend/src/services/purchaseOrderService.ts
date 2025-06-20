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
}

export default PurchaseOrderService;
