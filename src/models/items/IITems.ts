import { Document } from "mongoose";
export interface IItem extends Document {
    name: string;
    size: {
        S: number;
        M: number;
        L: number;
        XL: number;
        XXL: number;
        XXXL: number;
    };
    price: number;
    image: Buffer;
    packOf: number;
    fabric: string;
}
