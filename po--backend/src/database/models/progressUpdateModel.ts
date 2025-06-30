import mongoose, { Schema } from "mongoose";

export type DeliveryStatusType =
  | "New"
  | "InProgress"
  | "Ready and Packed"
  | "Ready for Inspection"
  | "QD Approved"
  | "QD Rejected"
  | "Cleared for Shipping"
  | "Delivery on Hold"
  | "Defer Delivery"
  | "CIPL Under Review"
  | "CIPL Reviewed and Rejected"
  | "CIPL Reviewed and Submitted To ADM"
  | "CIPL Under ADM Review"
  | "Awaiting Pickup"
  | "Shortclosed"
  | "Partially Dispatched"
  | "Dispatched"
  | "Preponed"
  | "On Hold"
  | "Deffered"
  | "Cancelled";

export enum DeliveryStatus {
  New = "New",
  InProgress = "InProgress",
  ReadyAndPacked = "Ready and Packed",
  ReadyForInspection = "Ready for Inspection",
  QDApproved = "QD Approved",
  QDRejected = "QD Rejected",
  ClearedForShipping = "Cleared for Shipping",
  DeliveryOnHold = "Delivery on Hold",
  DeferDelivery = "Defer Delivery",
  CIPLUnderReview = "CIPL Under Review",
  CIPLReviewedAndRejected = "CIPL Reviewed and Rejected",
  CIPLReviewedAndSubmittedToADM = "CIPL Reviewed and Submitted To ADM",
  CIPLUnderADMReview = "CIPL Under ADM Review",
  AwaitingPickUp = "Awaiting Pickup",
  Shortclosed = "Shortclosed",
  PartiallyDispatched = "Partially Dispatched",
  Dispatched = "Dispatched",
  Preponed = "Preponed",
  OnHold = "On Hold",
  Deffered = "Deffered",
  Cancelled = "Cancelled",
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
  delivery_status: DeliveryStatus;
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
    delivery_status: {
      type: String,
      enum: Object.values(DeliveryStatus),
      default: DeliveryStatus.New,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IProgressUpdate>(
  "ProgressUpdate",
  ProgressUpdateSchema,
);
