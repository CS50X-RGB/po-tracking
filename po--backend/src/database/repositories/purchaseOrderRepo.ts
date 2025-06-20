import { PoCreate } from "../../interfaces/poInterface";
import PurchaseOrderModel from "../models/purchaseOrderModel";

class PurchaseOrderRepo {
  constructor() {}
  public async createPurchaseOrder(po: PoCreate) {
    try {
      const newPoObject = await PurchaseOrderModel.create(po);

      return newPoObject?.toObject();
    } catch (error) {
      console.log(error, "error");
      throw new Error(`Error while creating po`);
    }
  }
}

export default PurchaseOrderRepo;
