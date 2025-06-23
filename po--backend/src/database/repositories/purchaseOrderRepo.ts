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


  public async getExwDate(id: any, date_required: Date) {
    try {
      const purchaseOrder: any =
        await PurchaseOrderModel.findById(id).populate("client_branch");

      if (!purchaseOrder || !purchaseOrder.client_branch) {
        throw new Error("Purchase order or client branch not found");
      }

      const clientBranch = purchaseOrder.client_branch as any;
      const exw_duration = clientBranch.exw_duration;

      if (!exw_duration || typeof exw_duration !== "number") {
        throw new Error("EXW duration is missing or invalid in client branch");
      }

      const requiredDate = new Date(date_required);
      const exw_date = new Date(requiredDate);
      exw_date.setDate(requiredDate.getDate() - exw_duration);

      return exw_date;
    } catch (error: any) {
      throw new Error(`Error while calculating EXW date: ${error.message}`);
    }
  }


}

export default PurchaseOrderRepo;
