import mongoose from "mongoose";

export interface rawMaterialInterface {
  source: string;
  inStock: number;
  received: number;
  planDate: Date;
  actualDate: Date;
  RMstatus: string;
  thresholdDate?: Date;
  RMtracker?: any;
}

export interface ciplInterface {
  isCiplReady: String;
  invoiceNo: String;
  ciplSubDateToClient: Date;
  ciplDocumentLink: String;
}

export interface wmsInterface {
  wmrefNo: string;
  modeOfTransport: any;
  forwarder: string;
  plannedPickupDate: any;
}
