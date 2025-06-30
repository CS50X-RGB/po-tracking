import mongoose, { Schema } from "mongoose";

type DeliveryStatusType =
  | "New"
  | "InProgress"
  | "Ready and Packed"
  | "Ready for Inspection"
  | "QD Approved"
  | "QD Rejected";

export enum DeliveryStatus {
  New = "New",
  InProgress = "InProgress",
  ReadyAndPacked = "Ready and Packed",
  ReadyForInspection = "Ready for Inspection",
  QDApproved = "QD Approved",
  QDRejected = "QD Rejected",
}

export interface IProgressUpdate extends Document {
  rawMaterial: mongoose.Schema.Types.ObjectId;
  underProcess: mongoose.Schema.Types.ObjectId;
  underSpecialProcess: mongoose.Schema.Types.ObjectId;
  finalInspection: mongoose.Schema.Types.ObjectId;
  LI: mongoose.Schema.Types.ObjectId;
  supplier: mongoose.Schema.Types.ObjectId;
  qty: Number;
  openqty: Number;
}

const ProgressUpdateSchema = new Schema<IProgressUpdate>(
  {
    rawMaterial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RawMaterial",
    },
    underProcess: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "underProcess",
    },
    underSpecialProcess: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "underSpecialProcess",
    },
    finalInspection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "finalInspection",
    },

    LI: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "line_item",
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "supplier",
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
    openqty: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IProgressUpdate>(
  "ProgressUpdate",
  ProgressUpdateSchema,
);
