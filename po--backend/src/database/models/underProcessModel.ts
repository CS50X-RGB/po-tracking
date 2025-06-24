import mongoose, { Schema } from "mongoose";

export enum underProcessStatus {
    OPEN = 'open',
    INPROGRESS = 'in-progress',
    PARTIALLY_COMPLETED = 'partially-completed',
    COMPLETED = 'completed'
}

export enum underProcessType {
    IN_HOUSE = 'in-house',
    OUTSOURCED = 'outsourced'
}

export interface IunderProcess extends Document {
    type: underProcessType,
    completedQuantity: number,
    pendingQuantity: number,
    planDate: Date,
    actualDate: Date,
    UPstatus: underProcessStatus,
    LI:mongoose.Schema.Types.ObjectId

};

const UnderProcessSchema = new Schema<IunderProcess>({
    type: {
        type: String,
        enum: underProcessType,
        default: underProcessType.IN_HOUSE
    },
    completedQuantity: {
        type: Number,
        required: true,
    },
    pendingQuantity: {
        type: Number,

    },
    planDate: {
        type: Date,
        required: true,
    },
    actualDate: {
        type: Date,

    },
    UPstatus: {
        type: String,
        enum: underProcessStatus
    },
    LI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "line_item",
        required: true,
    }

}, { timestamps: true })

export default mongoose.model<IunderProcess>('underProcess', UnderProcessSchema);