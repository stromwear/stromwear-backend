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
    actualPrice:number;
    price: number;
    image: string;
    image1: string
    image2: string;
    image3: string;
    packOf: number;
    fabric: string;
    errorMessage?: string;
}
