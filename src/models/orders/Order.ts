import mongoose, { Document, Schema } from "mongoose";
import { IOrder } from "./IOrder";
import cartItemSchema from "../cart/CartItemSchema"; // reusable import

const orderSchema: Schema = new Schema({
  userName: { type: String, required: true },
  orderId: { type: String, required: true },
  paymentId: { type: String, required: false },
  items: { type: [cartItemSchema], required: true },
  mobile: {type: Number,require:true},
  address: {type:String,require:true},
  trackingId: {type:String,default:""},
  amount: { type: Number, required: true },
  pinCode: {type:Number,require:true},
  paymentMode:{type:String,enum:["online","COD"],require:true},
  status: {type:String,enum:["captured","dispatched","failed"],require:true},
});

export default mongoose.model<IOrder & Document>("Order", orderSchema);
