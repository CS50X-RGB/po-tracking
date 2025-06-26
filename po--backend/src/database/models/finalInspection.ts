import mongoose, { Schema } from "mongoose";

export enum isQualityCheckCompletedEnum {
  YES = "yes",
  NO = "no",
}
export enum inspectionTracker {
  NOT_STARTED = "not-started",
  ON_TRACK = "on-track",
  DELAYED = "delayed",
}

export interface IfinalSchema extends Document {
  isQualityCheckCompleted: isQualityCheckCompletedEnum;
  inspectionThreshHoldDate: Date;
  inspectionTracker: inspectionTracker;
  QDLink: string;
  LI: mongoose.Schema.Types.ObjectId;
}

const FinalInspectionSchema = new Schema<IfinalSchema>(
  {
    isQualityCheckCompleted: {
      type: String,
      enum: isQualityCheckCompletedEnum,
      default: isQualityCheckCompletedEnum.NO,
    },
    inspectionThreshHoldDate: {
      type: Date,
    },
    inspectionTracker: {
      type: String,
      enum: inspectionTracker,
      default: inspectionTracker.NOT_STARTED,
    },
    QDLink: {
      type: String,
    },

    LI: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "line_item",
    },
  },
  { timestamps: true },
);

export default mongoose.model<IfinalSchema>(
  "finalInspection",
  FinalInspectionSchema,
);
