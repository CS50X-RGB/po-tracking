import { LineItemCreate } from "../../interfaces/lineItemInterface";
import LineItemModel from "../models/lineItemModel";

class LineItemRepo {
  constructor() {}

  public async createLineItem(lineItem: LineItemCreate) {
    try {
      const new_line = await LineItemModel.create(lineItem);
      return new_line?.toObject();
    } catch (error: any) {
      throw new Error(`Error while creating the line item: ${error.message}`);
    }
  }
}

export default LineItemRepo;
