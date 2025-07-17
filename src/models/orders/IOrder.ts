import { Document } from "mongoose";
import { ICartItem } from "../cart/ICart";

export interface IOrder extends Document {
  userName: string;
  orderId: string;
  paymentId:string,
  items: ICartItem[];
  amount: number;  
  mobile: number;
  address: string;
  paymentMode:"online" | "COD";
  pinCode:number;
  trackingId:string;
  status: "captured" | "dispatched" | "failed";
}
