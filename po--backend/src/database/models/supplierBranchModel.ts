import mongoose, { Schema } from "mongoose";

export interface ISupplierBranch extends Document {
  name: string;
  supplier: mongoose.Types.ObjectId;
}

const SupplierBranch = new Schema<ISupplierBranch>(
  {
    name: {
      type: String,
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "supplier",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<ISupplierBranch>(
  "supplier_branch",
  SupplierBranch,
);
