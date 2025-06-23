import mongoose, { Schema, Document } from 'mongoose';

export interface IPartNumberModel extends Document {
  name: string;
  description: string;

}

const PartNumberSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

});

PartNumberSchema.index({description: 1 }, { unique: true });

export default mongoose.model<IPartNumberModel>('PartNumber', PartNumberSchema);
