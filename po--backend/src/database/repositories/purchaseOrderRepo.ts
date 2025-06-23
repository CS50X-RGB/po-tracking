import { ObjectId } from "mongoose";
import { PoCreate } from "../../interfaces/poInterface";
import PurchaseOrderModel from "../models/purchaseOrderModel";

class PurchaseOrderRepo {
  constructor() { }
  public async createPurchaseOrder(po: PoCreate) {
    try {
      const newPoObject = await PurchaseOrderModel.create(po);

      return newPoObject?.toObject();
    } catch (error) {
      console.log(error, "error");
      throw new Error(`Error while creating po`);
    }
  }

  //Funtion to delte the PO by ID
  public async deletePurchaseOrderById(id: ObjectId) {
    try {
      const result = await PurchaseOrderModel.findByIdAndDelete(id);
      return result
    } catch (error) {
      throw new Error(`Error while deleting the PO`);
    }
  }

  //function to delete PO in bulk
  // public async deletePurchaseOrdersInBulk(ids: ObjectId[]) {
  //   try {
  //     const result = await PurchaseOrderModel.deleteMany({
  //       _id: { $in: ids }
  //     });
  //     return result.deletedCount;
  //   } catch (error) {
  //     throw new Error(`Error while Bulk deleting the PO`);
  //   }
  // }

  //Function to get All Purchase order
  public async getAllPO() {
    try {
      const POs = await PurchaseOrderModel.find()
        .populate("client_branch")
        .populate("client")
        .populate("freight_term")
        .populate("payment_term")
        .lean()
        

      return POs;
    } catch (error) {
      throw new Error(`Error while getting the PO`);
    }
  }

  //function to get the purchase order by ID
  public async getPOByID(id: ObjectId) {
    try {
      const PO = await PurchaseOrderModel.findById(id)
        .populate("client_branch")
        .populate("client")
        .populate("freight_term")
        .populate("payment_term")
      return PO;
    } catch (error) {
      throw new Error(`Error while getting the PO by this id - ${id}`);
    }
  }

  
}

export default PurchaseOrderRepo;
