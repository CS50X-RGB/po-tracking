import mongoose from "mongoose";

export interface rawMaterialInterface {
    source: string,
    inStock: number,
    received: number,
    planDate: Date,
    actualDate: Date,
    RMstatus: string,
    LI: mongoose.Schema.Types.ObjectId,
}