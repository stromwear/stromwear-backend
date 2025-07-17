import mongoose, { Schema } from "mongoose";
import { ICart } from "./ICart";
const cartItemSchema = new Schema({
    itemId: {type: Schema.Types.ObjectId,ref: "Item",required: true},
    image: {type:Buffer,required:true},
    price: {type:Number,required:true},
    selectedSize: {type: String,enum: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],required: true},
    quantity: {type: Number,required: true,min: 1}
});
const cartSchema = new Schema<ICart>({
    userName: {type: String,required: true},
    items: [cartItemSchema]
});
export default mongoose.model<ICart>("Cart", cartSchema);
