import mongoose from "mongoose";

export interface ClientCreate {
  name: string;
  address: string;
}

export interface ClientBranchCreate {
  name: string;
  client: mongoose.Types.ObjectId;
  exw_date: number;
}

export interface SupplierBranchCreate {
  name: string;
  supplier: mongoose.Types.ObjectId;
}
