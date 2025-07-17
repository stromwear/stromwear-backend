import { Types } from "mongoose";
export interface ItemView {
    itemId:Types.ObjectId,
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
    image: string;
    packOf: number;
    fabric: string;
    errorMessage?: string;
}
