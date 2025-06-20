import mongoose from "mongoose";

export interface PoCreate {
  name: string;
  client: mongoose.Types.ObjectId;
  client_branch: mongoose.Types.ObjectId;
  freight_term: mongoose.Types.ObjectId;
  payment_term: mongoose.Types.ObjectId;
  order_date: Date;
}
