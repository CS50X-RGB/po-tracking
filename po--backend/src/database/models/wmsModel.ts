import mongoose, { Schema, Document } from "mongoose";

export enum ModeOfTransportEnum {
  AIR = "air",
  SEA = "sea",
}

export interface IWmsModel extends Document {
  wmrefNo: string;
  modeOfTransport: ModeOfTransportEnum;
  forwarder: string;
  plannedPickupDate: Date;
}

const wmsSchema = new Schema<IWmsModel>({
  wmrefNo: {
    type: String,
    required: true,
  },
  modeOfTransport: {
    type: String,
    enum: Object.values(ModeOfTransportEnum),
    required: true,
  },
  forwarder: {
    type: String,
    required: true,
  },
  plannedPickupDate: {
    type: Date,
    required: true,
  },
});

export default mongoose.model<IWmsModel>("wms_model", wmsSchema);
