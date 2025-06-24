import mongoose, { Schema } from "mongoose";

export enum rawMaterialStatus {
    OPEN = 'open',
    INTRANSIST = 'in-transist',
    PARTIALRECEIVED = 'partial-received',
    RECEIVED = 'received'
}

export enum rawMaterialSources {
    IMPORTED = 'imported',
    LOCAL = 'local'
}

export enum RMtracker {
    NOT_STARTED = 'not-started',
    ON_TRACK = 'on-track',
    DELAYED = 'delayed'
}

export interface IRawMaterial extends Document {
    source: rawMaterialSources,
    inStock: number,
    received: number,
    planDate: Date,
    actualDate: Date,
    RMstatus: rawMaterialStatus,
    RMtracker: RMtracker,
    LI:mongoose.Schema.Types.ObjectId,

};

const RawMaterialSchema = new Schema<IRawMaterial>({
    source: {
        type: String,
        enum: rawMaterialSources,
        default: rawMaterialSources.LOCAL
    },
    inStock: {
        type: Number,
        required: true,
    },
    received: {
        type: Number,

    },
    planDate: {
        type: Date,
        required: true,
    },
    actualDate: {
        type: Date,

    },
    RMstatus: {
        type: String,
        enum: rawMaterialStatus
    },
    RMtracker: {
        type: String,
        enum: RMtracker,
        default: RMtracker.NOT_STARTED
    },

    LI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "line_item",
        required: true,
    }


}, { timestamps: true })

export default mongoose.model<IRawMaterial>('RawMaterial', RawMaterialSchema);