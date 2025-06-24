import mongoose, { Schema } from "mongoose";

export interface IProgressUpdate extends Document {
  rawMaterial: mongoose.Schema.Types.ObjectId;
  underProcess: mongoose.Schema.Types.ObjectId;
  underSpecialProcess: mongoose.Schema.Types.ObjectId;
  finalInspection: mongoose.Schema.Types.ObjectId;
  LI: mongoose.Schema.Types.ObjectId;
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
  },
  { timestamps: true },
);

export default mongoose.model<IProgressUpdate>(
  "ProgressUpdate",
  ProgressUpdateSchema,
);
