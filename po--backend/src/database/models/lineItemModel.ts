import mongoose, { Document, Schema } from "mongoose";

type LineItemStatus =
  | "Active"
  | "Preponed"
  | "On Hold"
  | "Deffered"
  | "Cancelled"
  | "ShortClosed"
  | "Rejected"
  | "Delivered"
  | "Partially Dispatched"
  | "In Transit Full Qty"
  | "Partially Delivered"
  | "Pending LI Change Approval";

type LineItemType = "Production" | "FAI";

export interface ILineItemModel extends Document {
  name: string;
  partNumber: mongoose.Schema.Types.ObjectId;
  supplier: mongoose.Schema.Types.ObjectId;
  unit_cost: number;
  total_cost: number;
  qty: number;
  supplier_readliness_date: Date;
  exw_date: Date;
  ssn: string;
  priority: string;
  uom: mongoose.Schema.Types.ObjectId;
  purchaseOrder: mongoose.Schema.Types.ObjectId;
  order_date: Date;
  date_required: Date;
  open_qty: number;
  currency: string;
  value_delivered: number;
  line_item_status: LineItemStatus;
  line_item_type: LineItemType;
}

const lineItemSchema = new Schema<ILineItemModel>({
  name: {
    type: String,
    required: true,
  },
  partNumber: {
    type: Schema.Types.ObjectId,
    ref: "PartNumber",
    required: true,
  },
  supplier: {
    type: Schema.Types.ObjectId,
    ref: "supplier",
    required: true,
  },
  uom: {
    type: Schema.Types.ObjectId,
    ref: "unit_of_measurement",
    required: true,
  },
  priority: {
    type: String,
    default: "High",
  },
  currency: {
    type: String,
    required: true,
  },
  unit_cost: {
    type: Number,
    required: true,
  },
  total_cost: {
    type: Number,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  supplier_readliness_date: {
    type: Date,
  },
  date_required: {
    type: Date,
  },
  exw_date: {
    type: Date,
    required: true,
  },
  ssn: {
    type: String,
  },
  purchaseOrder: {
    type: Schema.Types.ObjectId,
    ref: "po",
    required: true,
  },
  order_date: {
    type: Date,
    required: true,
  },
  open_qty: {
    type: Number,
    defualt: 0,
  },
  value_delivered: {
    type: Number,
    default: 0,
  },
  line_item_status: {
    type: String,
    enum: [
      "Active",
      "Preponed",
      "On Hold",
      "Deffered",
      "Cancelled",
      "ShortClosed",
      "Rejected",
      "Delivered",
      "Partially Dispatched",
      "In Transit Full Qty",
      "Partially Delivered",
      "Pending LI Change Approval",
    ],
    default: "Active",
  },
  line_item_type: {
    type: String,
    enum: ["Production", "FAI"],
    required: true,
  },
});

export default mongoose.model<ILineItemModel>("line_item", lineItemSchema);
