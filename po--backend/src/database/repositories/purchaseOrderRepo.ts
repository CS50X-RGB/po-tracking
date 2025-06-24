import { ObjectId } from "mongoose";
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

  //Funtion to delte the PO by ID
  public async deletePurchaseOrderById(id: ObjectId) {
    try {
      const result = await PurchaseOrderModel.findByIdAndDelete(id);
      return result;
    } catch (error) {
      throw new Error(`Error while deleting the PO`);
    }
  }

  public async pushLineItem(poId: any, lineItemId: any) {
    try {
      const updatePo = await PurchaseOrderModel.findOneAndUpdate(
        { _id: poId },
        { $push: { lineItem: lineItemId } },
        { new: true },
      );
      return updatePo;
    } catch (error) {
      throw new Error(`Error while pushing the Line Item to PO: ${error}`);
    }
  }

  //Function to get All Purchase order
  public async getAllPO(page: number, offset: number) {
    try {
      const POs = await PurchaseOrderModel.find()
        .populate("client")
        .populate("client_branch")
        .populate("payment_term")
        .populate("freight_term")
        .skip((page - 1) * offset)
        .limit(offset)
        .lean();
      const total = await PurchaseOrderModel.countDocuments();
      return {
        data: POs,
        total,
      };
    } catch (error) {
      throw new Error(`Error while getting the PO`);
    }
  }

  public async getPOByID(id: ObjectId) {
    try {
      const po = await PurchaseOrderModel.findById(id)
        .populate("client")
        .populate("client_branch")
        .populate("payment_term")
        .populate("freight_term")
        .populate({
          path: "lineItem",
          populate: {
            path: "partNumber supplier",
          },
        });

      return po?.toObject();
    } catch (error) {
      throw new Error(`Error while getting the PO by this id - ${error}`);
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
      const exw_duration = clientBranch.exw_date;
      // if (!exw_duration || typeof exw_duration !== "number") {
      //   throw new Error("EXW duration is missing or invalid in client branch");
      // }

      const requiredDate = new Date(date_required);
      const exw_date = new Date(requiredDate);
      exw_date.setDate(requiredDate.getDate() - exw_duration);

      return {
        exw_date,
        order_date: purchaseOrder.order_date,
      };
    } catch (error: any) {
      throw new Error(`Error while calculating EXW date: ${error.message}`);
    }
  }
}

export default PurchaseOrderRepo;
