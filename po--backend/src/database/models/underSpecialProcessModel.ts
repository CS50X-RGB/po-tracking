import mongoose, { Schema } from "mongoose";

export enum underSpecialProcessStatus {
  OPEN = "open",
  INPROGRESS = "in-progress",
  PARTIALLY_COMPLETED = "partially-completed",
  COMPLETED = "completed",
}

export enum underSpecialProcessType {
  IN_HOUSE = "in-house",
  OUTSOURCED = "outsourced",
}

export interface IunderSpecialProcess extends Document {
  type: underSpecialProcessType;
  completedQuantity: number;
  pendingQuantity: number;
  planDate: Date;
  actualDate: Date;
  USPstatus: underSpecialProcessStatus;
  LI: mongoose.Schema.Types.ObjectId;
}

const UnderSpecialProcessSchema = new Schema<IunderSpecialProcess>(
  {
    type: {
      type: String,
      enum: underSpecialProcessType,
      default: underSpecialProcessType.IN_HOUSE,
    },
    completedQuantity: {
      type: Number,
      required: true,
    },
    pendingQuantity: {
      type: Number,
    },
    planDate: {
      type: Date,
    },
    actualDate: {
      type: Date,
    },
    USPstatus: {
      type: String,
      enum: underSpecialProcessStatus,
    },
    LI: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "line_item",
    },
  },
  { timestamps: true },
);

export default mongoose.model<IunderSpecialProcess>(
  "underSpecialProcess",
  UnderSpecialProcessSchema,
);
