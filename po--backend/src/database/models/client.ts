import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
    name: string;
    address: string;
    phone: string;
    fax: string;
}

const ClientSchema = new Schema<IClient>({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
    },
    fax: {
        type: String,
    }
});

export default mongoose.model<IClient>('client', ClientSchema);