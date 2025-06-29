import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  password: string;
  email: string;
  isBlocked: boolean;
  role: mongoose.Schema.Types.ObjectId;
  client: mongoose.Schema.Types.ObjectId;
  supplier: mongoose.Schema.Types.ObjectId;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      unique: true,
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "client",
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "supplier",
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "role",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IUser>("user", UserSchema);
