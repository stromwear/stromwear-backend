import { Types } from "mongoose";

export interface CartItemView {
    itemId: Types.ObjectId;
    selectedSize: 'S' | 'S' | 'L' | 'XL' | 'XXL' | 'XXXL';
    image:string,
    price:number,
    quantity: number;
}
export interface CartView {
    userName: string;
    items: CartItemView[];
}
