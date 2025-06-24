import mongoose from "mongoose";

export interface PoCreate {
  name: string;
  client: mongoose.Types.ObjectId;
  client_branch: mongoose.Types.ObjectId;
  freight_term: mongoose.Types.ObjectId;
  payment_term: mongoose.Types.ObjectId;
  order_date: Date;
}

export interface PoCreateExcel {
  po_name: string;
  name: string;
  client: string;
  client_branch: string;
  freight_term: string;
  payment_term: string;
  order_date: Date;
  supplier: string;
  part_number: string;
  line_item_type: string;
  priority: string;
  uom: string;
  qty: string;
  currency: string;
  unit_price: string;
  date_required: string;
}
