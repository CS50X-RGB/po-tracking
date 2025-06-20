import mongoose, { Schema, Document } from "mongoose";

export interface IPayementTerms extends Document {
  name: string;
}

const PaymentTermsSchema = new Schema<IPayementTerms>({
  name: {
    type: String,
    required: true,
  },
});

export default mongoose.model<IPayementTerms>(
  "payment_terms",
  PaymentTermsSchema,
);
