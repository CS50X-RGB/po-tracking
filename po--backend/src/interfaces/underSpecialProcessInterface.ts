import mongoose from "mongoose";

export interface underSpecialProcessInterface {
  type: String;
  completedQuantity: number;
  pendingQuantity: number;
  planDate: Date;
  actualDate: Date;
  USPstatus: String;
}
