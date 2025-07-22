import { Schema } from "mongoose";
import mongoose from "mongoose";
import { IItem } from "./IITems";
const itemSchema: Schema = new mongoose.Schema({
    name: { type: String, required: true },
    size: {
        S: { type: Number, default: 0 },
        M: { type: Number, default: 0 },
        L: { type: Number, default: 0 },
        XL: { type: Number, default: 0 },
        XXL: { type: Number, default: 0 },
        XXXL: { type: Number, default: 0 },
    },
    price: { type: Number, required: true },
    image: { type: Buffer, required: true },
    image1: { type: Buffer, required: true },
    image2: { type: Buffer, required: true },
    image3: { type: Buffer, required: true },
    actualPrice:{type:Number, require:true},
    packOf: { type: Number},
    fabric: { type: String }
});

export default mongoose.model<IItem>("items", itemSchema);
