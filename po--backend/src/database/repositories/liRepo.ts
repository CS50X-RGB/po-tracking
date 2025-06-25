import { String } from "aws-sdk/clients/ssmquicksetup";
import { LineItemCreate } from "../../interfaces/lineItemInterface";
import LineItemModel from "../models/lineItemModel";
import ProgressUpdateRepo from "./progressUpdateRepo";

class LineItemRepo {
  private progresUpdateRepo: ProgressUpdateRepo;
  constructor() {
    this.progresUpdateRepo = new ProgressUpdateRepo();
  }

  public async createLineItem(lineItem: LineItemCreate) {
    try {
      console.log(lineItem, "Line Item");
      const new_line = await LineItemModel.create(lineItem);
      return new_line?.toObject();
    } catch (error: any) {
      console.log(error, "Error");
      throw new Error(`Error while creating the line item: ${error.message}`);
    }
  }
  public async getNonAcceptedLineItem(poId: any, supplierId: any) {
    try {
      const allLineItems = await LineItemModel.find({
        purchaseOrder: poId,
        supplier: supplierId,
        supplier_readliness_date: { $in: [null, undefined] },
      })
        .populate("uom partNumber")
        .lean();
      return allLineItems;
    } catch (error) {
      throw new Error(`Error while getting All line Items`);
    }
  }

  public async accepteLineItem(
    id: string,
    supplier_readiness_date: Date,
    ssn?: string,
  ) {
    try {
      let filter: any = {
        supplier_readiness_date,
      };
      if (ssn) {
        filter.ssn = ssn;
      }
      const updatedLi = await LineItemModel.findByIdAndUpdate(id, filter, {
        new: true,
      });

      if (!updatedLi) {
        throw new Error(`Line Item with ID ${id} not found`);
      }
      // Create Progress Update Entity by line item id
      const progressUpdate = await this.progresUpdateRepo.createProgressUpdate({
        LI: id,
      });

      return updatedLi;
    } catch (error) {
      console.error(error, "Error updating Line Item");
      throw new Error("Failed to update Line Item");
    }
  }
}

export default LineItemRepo;
