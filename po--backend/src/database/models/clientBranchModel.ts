import mongoose, { Schema, Document } from 'mongoose';

export interface IClientBranch extends Document {
    name: string;
    client: mongoose.Types.ObjectId;
    exw_date: number; 
}

const ClientBranchSchema = new Schema<IClientBranch>(
    {
        name: {
            type: String,
            required: true,
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'client',
            required: true, 
        },
        exw_date: {
            type: Number,
        },
    },
    { timestamps: true }
);

export default mongoose.model<IClientBranch>('client_branch', ClientBranchSchema);
