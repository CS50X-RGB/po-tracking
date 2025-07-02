import mongoose, { Schema, Document } from "mongoose";

export enum LogisticsStatus {
  PLANNED_VESSEL = "planned_vessel",
  PLANNED_FLIGHT = "planned_flight",
  ESTIMATED_DEPARTURE_FROM_ORIGIN = "estimated_depature_from_origin",
  DELIVERY_DATE_OF_ADM = "delivery_date_of_adm",
  DELIVERED = "delivered",
}

export type LogisticsDeliveryStatus = keyof typeof LogisticsStatus;

export interface ILogistics extends Document {
  purchaseOrder: mongoose.Schema.Types.ObjectId;
  wms: mongoose.Schema.Types.ObjectId;
  cipl: mongoose.Schema.Types.ObjectId;
  supplier: mongoose.Schema.Types.ObjectId;
  delivery_status?: LogisticsStatus;
  delivery_date: Date;
  tracking_link: string;
  tracking_number: string;
}

const schema = new Schema<ILogistics>({
  purchaseOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "po",
    required: true,
  },
  wms: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "wms_model",
    required: true,
  },
  cipl: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ciplModel",
    required: true,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "supplier",
    required: true,
  },
  delivery_status: {
    type: String,
    enum: Object.values(LogisticsStatus),
  },
  tracking_number: {
    type: String,
  },
  tracking_link: {
    type: String,
  },
  delivery_date: {
    type: Date,
  },
});

export default mongoose.model<ILogistics>("logistics", schema);
