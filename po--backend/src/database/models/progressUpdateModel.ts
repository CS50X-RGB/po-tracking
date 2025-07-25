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
  CIPLUnderReview = "CIPLUnderReview",
  CIPLReviewedAndRejected = "CIPLReviewedAndRejected",
  CIPLReviewedAndSubmittedToADM = "CIPLReviewedAndSubmittedToADM",
  CIPLUnderADMReview = "CIPLUnderADMReview",
  AwaitingPickUp = "AwaitingPickUp",
  Shortclosed = "Shortclosed",
  PartiallyDispatched = "PartiallyDispatched",
  Dispatched = "Dispatched",
  Preponed = "Preponed",
  OnHold = "On Hold",
  Deffered = "Deffered",
  Cancelled = "Cancelled",
}

export enum ProgressTrackerEnum {
  NOT_STARTED = "not_started",
  ON_TRACK = "on_track",
  DELAYED = "delayed",
}

export interface IProgressUpdate extends Document {
  rawMaterial: mongoose.Schema.Types.ObjectId;
  underProcess: mongoose.Schema.Types.ObjectId;
  underSpecialProcess: mongoose.Schema.Types.ObjectId;
  finalInspection: mongoose.Schema.Types.ObjectId;
  LI: mongoose.Schema.Types.ObjectId;
  cipl: mongoose.Schema.Types.ObjectId;
  wms: mongoose.Schema.Types.ObjectId;
  supplier: mongoose.Schema.Types.ObjectId;
  qty: Number;
  openqty: Number;
  tentative_planned_date: Date;
  dispatchedQty: Number;
  feed_back_tracker: mongoose.Schema.Types.ObjectId[];
  delivery_status: DeliveryStatus;
  dispatched_date: Date;
  progressTracker: ProgressTrackerEnum;
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
    tentative_planned_date: {
      type: "Date",
    },
    wms: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "wms_model",
    },
    cipl: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ciplModel",
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
    dispatchedQty: {
      type: Number,
      default: 0,
    },
    qty: {
      type: Number,
      required: true,
    },
    dispatched_date: {
      type: Date,
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
    progressTracker: {
      type: String,
      enum: Object.values(ProgressTrackerEnum),
      default: ProgressTrackerEnum.NOT_STARTED,
    },
    feed_back_tracker: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "feed_back_tracker_model",
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model<IProgressUpdate>(
  "ProgressUpdate",
  ProgressUpdateSchema,
);
