import mongoose, { Schema, Document } from "mongoose";

export enum FeedBackTrackerStatus {
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
  Active = "Active",
  Preponed = "Preponed",
  OnHold = "On Hold",
  Deffered = "Deffered",
  Cancelled = "Cancelled",
  PendingLIChangeApproval = "Pending LI Change Approval",
}

export interface IFeedBackTracker extends Document {
  line_item: mongoose.Schema.Types.ObjectId;
  prev_line_item_status: FeedBackTrackerStatus;
  new_line_item_status: FeedBackTrackerStatus;
  prev_supplier_readliness_date: Date;
  new_supplier_readliness_date: Date;
  prev_exw_date: Date;
  new_exw_date: Date;
}

const schema = new Schema<IFeedBackTracker>({
  line_item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProgressUpdates",
    required: true,
  },
  prev_line_item_status: {
    type: String,
    enum: Object.values(FeedBackTrackerStatus),
  },
  new_line_item_status: {
    type: String,
    enum: Object.values(FeedBackTrackerStatus),
  },
  prev_supplier_readliness_date: {
    type: Date,
  },
  new_supplier_readliness_date: {
    type: Date,
  },
  prev_exw_date: {
    type: Date,
  },
  new_exw_date: {
    type: Date,
  },
});

export default mongoose.model<IFeedBackTracker>(
  "feed_back_tracker_model",
  schema,
);
