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
    actualPrice:number;
    price: number;
    image: Buffer;
    image1: Buffer;
    image2: Buffer;
    image3: Buffer;
    packOf: number;
    fabric: string;
}
