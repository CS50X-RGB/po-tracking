import { String } from "aws-sdk/clients/qapps";
import mongoose from "mongoose";

export interface underProcessInterface {
  type: String;
  completedQuantity: number;
  pendingQuantity: number;
  planDate: Date;
  actualDate: Date;
  UPstatus: String;
}
