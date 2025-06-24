import mongoose from "mongoose";

export interface LineItemCreate {
  name: string;
  partNumber: mongoose.Schema.Types.ObjectId;
  supplier: mongoose.Schema.Types.ObjectId;
  unit_cost: number;
  qty: number;
  exw_date: Date;
  purchaseOrder: mongoose.Schema.Types.ObjectId;
  total_cost: number;
  order_date: Date;
  date_required: Date;
  currency: string;
  uom: mongoose.Schema.Types.ObjectId;
  line_item_type: "FAI" | "Production";
}

export interface LineItemCreateExcel {
  name: string;
  priority: string;
  partNumber: any;
  supplier: any;
  unit_cost: number;
  qty: number;
  exw_date: Date;
  purchaseOrder: any;
  total_cost: any;
  order_date: Date;
  date_required: Date;
  currency: string;
  uom: any;
  line_item_type: any;
}
