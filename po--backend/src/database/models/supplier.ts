import mongoose, { Schema, Document } from "mongoose";

export interface ISupplier extends Document {
  name: string;
  address: string;
  phone: string;
  fax: string;
}

const SupplierSchema = new Schema<ISupplier>({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  fax: {
    type: String,
  },
});

export default mongoose.model<ISupplier>("supplier", SupplierSchema);
