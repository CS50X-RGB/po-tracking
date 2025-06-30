import mongoose, { Document, Schema } from "mongoose";

export enum isCiplReadyEnum {
  YES = "yes",
  NO = "no",
}

export interface ICiplModel extends Document {
  isCiplReady: isCiplReadyEnum;
  invoiceNo: String;
  ciplSubDateToClient: Date;
  ciplDocumentLink: String;
}

const ciplSchema = new Schema<ICiplModel>({
  isCiplReady: {
    type: String,
    value: Object.values(isCiplReadyEnum),
    required: true,
  },
  invoiceNo: {
    type: String,
    required: true,
  },
  ciplSubDateToClient: {
    type: Date,
    required: true,
  },
  ciplDocumentLink: {
    type: String,
    required: true,
  },
});

export default mongoose.model<ICiplModel>("ciplModel", ciplSchema);
