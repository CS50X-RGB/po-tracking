import mongoose, { Document, Schema } from "mongoose";

export interface IPo extends Document {
  name: string;
  client: mongoose.Types.ObjectId;
  client_branch: mongoose.Types.ObjectId;
  freight_term: mongoose.Types.ObjectId;
  payment_term: mongoose.Types.ObjectId;
  lineItem: mongoose.Types.ObjectId[];
  order_date: Date;
}

const PoSchema: Schema = new Schema<IPo>(
  {
    name: {
      type: String,
      required: true,
    },
    client_branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "client_branch",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "client",
      required: true,
    },
    freight_term: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "fright_terms",
      required: true,
    },
    lineItem: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "line_item",
      },
    ],
    payment_term: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment_terms",
      required: true,
    },
    order_date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IPo>("po", PoSchema);
