import mongoose, { Schema } from "mongoose";

export enum isQualityCheckCompleted {
    YES = 'yes',
    NO = 'no',
}
export enum inspectionTracker {
    NOT_STARTED = 'not-started',
    ON_TRACK = 'on-track',
    DELAYED = 'delayed'
}

export interface IfinalSchema extends Document {
    isQualityCheckCompleted: isQualityCheckCompleted,
    inspectionThreshHoldDate: Date,
    inspectionTracker: inspectionTracker,
    QDLink: string,
    LI:mongoose.Schema.Types.ObjectId,

}

const FinalInspectionSchema = new Schema<IfinalSchema>({
    isQualityCheckCompleted: {
        type: String,
        enum: isQualityCheckCompleted,
        default: isQualityCheckCompleted.NO
    },
    inspectionThreshHoldDate: {
        type: Date,
        required: true
    },
    inspectionTracker: {
        type: String,
        enum: inspectionTracker,
        default: inspectionTracker.NOT_STARTED
    },
    QDLink: {
        type: String,
        required: true,
    },

    LI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "line_item",
        required: true,
    }
}, { timestamps: true })

export default mongoose.model<IfinalSchema>('finalInspection', FinalInspectionSchema)