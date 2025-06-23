import mongoose from "mongoose";

export interface LineItemCreate {
  partNumber: mongoose.Schema.Types.ObjectId;
  supplier: mongoose.Schema.Types.ObjectId;
  unit_cost: number;
  qty: number;
  exw_date: Date;
  purchaseOrder: mongoose.Schema.Types.ObjectId;
  total_cost: number;
  order_date: Date;
  date_required: Date;
  line_item_type: "FAI" | "Production";
}
