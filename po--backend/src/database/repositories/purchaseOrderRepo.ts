import mongoose, { Types, ObjectId } from "mongoose";
import { PoCreate, PoCreateExcel } from "../../interfaces/poInterface";
import PurchaseOrderModel from "../models/purchaseOrderModel";
import ClientRepo from "./clientRepo";
import SupplierRepo from "./supplierRepo";
import LineItemRepo from "./liRepo";
import {
  LineItemCreate,
  LineItemCreateExcel,
} from "../../interfaces/lineItemInterface";
import PartNumberRepository from "./partNumberRepository";
import UOMRepo from "./unitOfMeasurementrRepository";

class PurchaseOrderRepo {
  private clientRepo: ClientRepo;
  private lineItemRepo: LineItemRepo;
  private uomRepo: UOMRepo;
  private supplierRepo: SupplierRepo;
  private partNumberRepo: PartNumberRepository;
  constructor() {
    this.clientRepo = new ClientRepo();
    this.supplierRepo = new SupplierRepo();
    this.uomRepo = new UOMRepo();
    this.lineItemRepo = new LineItemRepo();
    this.partNumberRepo = new PartNumberRepository();
  }

  public async createImportEntities(data: PoCreateExcel[]) {
    try {
      let count = 0;
      let po_arr = [];
      for (const po of data) {
        const check = await this.checkPurchaseOrderByName(po.po_name);
        const client: any = await this.clientRepo.getEntity(
          "Client",
          po.client,
        );

        const client_branch: any = await this.clientRepo.getEntity(
          "Client_Branch",
          po.client_branch,
        );
        const payment_term: any = await this.clientRepo.getEntity(
          "Payment_Term",
          po.payment_term,
        );
        const freight_term: any = await this.clientRepo.getEntity(
          "Frieght_Term",
          po.freight_term,
        );
        const part_number: any = await this.partNumberRepo.getPartNumber(
          po.part_number,
        );
        const supplier: any = await this.supplierRepo.getSupplier(po.supplier);
        const uom: any = await this.uomRepo.findUOMByName(po.uom);
        let poObject: any;
        if (check === null) {
          if (client && client_branch && payment_term && freight_term) {
            const createPurchase: PoCreate = {
              name: po.po_name,
              client: client?._id,
              client_branch: client_branch?._id,
              payment_term: payment_term?._id,
              freight_term: freight_term?._id,
              order_date: new Date(po.order_date),
            };
            poObject = await this.createPurchaseOrder(createPurchase);
            count++;
          }
        } else {
          poObject = check;
        }

        const { exw_date, order_date }: any = await this.getExwDate(
          poObject?._id,
          new Date(po.date_required),
        );

        const lineItem: LineItemCreateExcel = {
          name: po.name,
          partNumber: part_number?._id,
          purchaseOrder: poObject?._id,
          qty: Number(po.qty),
          priority: po.priority,
          exw_date,
          supplier: supplier?._id,
          unit_cost: Number(po.unit_price),
          order_date: new Date(po.order_date),
          currency: po.currency,
          date_required: new Date(po.date_required),
          total_cost: Number(po.unit_price) * Number(po.qty),
          uom: uom._id,
          line_item_type: po.line_item_type,
        };
        const line_item_create =
          await this.lineItemRepo.createLineItem(lineItem);
        po_arr.push(poObject);
        await this.pushLineItem(poObject?._id, line_item_create._id);
      }
      return { po: po_arr, count };
    } catch (error) {
      throw new Error(`Error while creating importing excel sheet`);
    }
  }

  public async createPurchaseOrder(po: PoCreate) {
    try {
      const newPoObject = await PurchaseOrderModel.create(po);
      return newPoObject?.toObject();
    } catch (error) {
      console.log(error, "error");
      throw new Error(`Error while creating po`);
    }
  }

  public async checkPurchaseOrderByName(name: string) {
    try {
      const purchaseOrder = await PurchaseOrderModel.findOne({
        name: name,
      });
      return purchaseOrder ? purchaseOrder : null;
    } catch (error) {
      throw new Error(`Error while getting checking`);
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
  public async getAllPO(
    page: number,
    offset: number,
    supplierId?: mongoose.Types.ObjectId,
  ) {
    try {
      const filter: any = {};

      if (supplierId) {
        filter.supplier = supplierId;
      }
      const POs = await PurchaseOrderModel.find(filter)
        .populate("client")
        .populate("client_branch")
        .populate("payment_term")
        .populate("freight_term")
        .skip((page - 1) * offset)
        .limit(offset)
        .lean();

      console.log("PO is", POs);

      const total = await PurchaseOrderModel.countDocuments(filter);
      return {
        data: POs,
        total,
      };
    } catch (error) {
      throw new Error(`Error while getting the PO`);
    }
  }
  //get open value-> not completed
  public async getOpenPO(
    page: number,
    offset: number,
    supplierId?: any,
    clientId?: any,
  ) {
    try {
      const matchStage: any = {
        "lineItemDocs.supplier_readliness_date": { $ne: null },
      };

      if (supplierId) {
        matchStage["lineItemDocs.supplier"] = new Types.ObjectId(supplierId);
      }
      if (clientId) {
        matchStage["client"] = new Types.ObjectId(clientId);
      }

      const pipeline = [
        {
          $lookup: {
            from: "line_items",
            localField: "lineItem",
            foreignField: "_id",
            as: "lineItemDocs",
          },
        },
        { $unwind: "$lineItemDocs" },
        { $match: matchStage },

        // Populate client_branch
        {
          $lookup: {
            from: "client_branches",
            localField: "client_branch",
            foreignField: "_id",
            as: "client_branch",
          },
        },
        {
          $unwind: { path: "$client_branch", preserveNullAndEmptyArrays: true },
        },

        // Populate client
        {
          $lookup: {
            from: "clients",
            localField: "client",
            foreignField: "_id",
            as: "client",
          },
        },
        { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },

        // Populate freight_term
        {
          $lookup: {
            from: "freight_terms",
            localField: "freight_term",
            foreignField: "_id",
            as: "freight_term",
          },
        },
        {
          $unwind: { path: "$freight_term", preserveNullAndEmptyArrays: true },
        },

        // Populate payment_term
        {
          $lookup: {
            from: "payment_terms",
            localField: "payment_term",
            foreignField: "_id",
            as: "payment_term",
          },
        },
        {
          $unwind: { path: "$payment_term", preserveNullAndEmptyArrays: true },
        },

        // Group by PO ID while retaining doc + calculating poTotal
        {
          $group: {
            _id: "$_id",
            doc: { $first: "$$ROOT" },
            poTotal: { $sum: "$lineItemDocs.total_cost" },
          },
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: ["$doc", { poTotal: "$poTotal" }],
            },
          },
        },
        { $skip: (page - 1) * offset },
        { $limit: offset },
      ];

      const data = await PurchaseOrderModel.aggregate(pipeline);

      // For total count:
      const countPipeline = [
        {
          $lookup: {
            from: "line_items",
            localField: "lineItem",
            foreignField: "_id",
            as: "lineItemDocs",
          },
        },
        { $unwind: "$lineItemDocs" },
        { $match: matchStage },
        {
          $group: {
            _id: "$_id",
          },
        },
        {
          $count: "total",
        },
      ];

      const totalAgg = await PurchaseOrderModel.aggregate(countPipeline);
      const total = totalAgg[0]?.total ?? 0;

      return {
        data,
        total,
      };
    } catch (error) {
      console.error("Error getting open POs:", error);
      throw new Error(`Error getting open POs`);
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
            path: "partNumber supplier uom",
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
  //add one check supplier id == supplier id of line item
  public async getNonAcceptedPo(supplierId: any) {
    try {
      const pos = await PurchaseOrderModel.aggregate([
        {
          $lookup: {
            from: "line_items",
            localField: "lineItem",
            foreignField: "_id",
            as: "lineItems",
          },
        },
        {
          $match: {
            lineItems: {
              $elemMatch: {
                supplier: new Types.ObjectId(supplierId),
                supplier_readliness_date: { $in: [null, undefined] },
              },
            },
          },
        },
      ]);
      const finalObjs = await Promise.all(
        pos.map(async (po: any) => {
          const fullPo = await PurchaseOrderModel.findById(po._id)
            .populate("client")
            .populate("client_branch")
            .populate("freight_term")
            .populate("payment_term")
            .populate({
              path: "lineItem",
              populate: [{ path: "supplier" }, { path: "uom" }],
            })
            .lean();

          if (fullPo != null) {
            fullPo.lineItem = fullPo.lineItem.filter((li: any) => {
              return (
                li.supplier_readliness_date === null ||
                li.supplier_readliness_date === undefined
              );
            });
            return fullPo;
          } else {
            return null;
          }
        }),
      );

      return finalObjs;
    } catch (error) {
      console.error("Error fetching non-accepted POs:", error);
      throw new Error("Failed to fetch non-accepted purchase orders.");
    }
  }
}

export default PurchaseOrderRepo;
