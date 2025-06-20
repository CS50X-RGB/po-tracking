import mongoose, { Schema, Document } from "mongoose";

export interface IFrieghtTerms extends Document {
  name: string;
}

const FrieghtTermsSchema = new Schema<IFrieghtTerms>({
  name: {
    type: String,
    required: true,
  },
});

export default mongoose.model<IFrieghtTerms>(
  "fright_terms",
  FrieghtTermsSchema,
);
