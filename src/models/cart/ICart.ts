import { Document, Types } from "mongoose";
export interface ICartItem {
    itemId: Types.ObjectId;
    selectedSize: 'S' | 'S' | 'L' | 'XL' | 'XXL' | 'XXXL';
    image:Buffer,
    price:number,
    quantity: number;
}
export interface ICart extends Document {
    userName: string;
    items: ICartItem[];
}
