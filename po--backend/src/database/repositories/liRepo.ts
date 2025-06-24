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
      const new_line = await LineItemModel.create(lineItem);
      return new_line?.toObject();
    } catch (error: any) {
      throw new Error(`Error while creating the line item: ${error.message}`);
    }
  }
  //accept line item method
  //SSN and Suplier readiness dater dallin h line item entity jo myjhe

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
      // Create Progress Update Entity by line item id

      return updatedLi;
    } catch (error) {
      console.error(error, "Error updating Line Item");
      throw new Error("Failed to update Line Item");
    }
  }
}

export default LineItemRepo;
