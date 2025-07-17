import { Schema } from "mongoose";

const cartItemSchema = new Schema(
  {
    itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    image: { type: Buffer, required: true },
    price: { type: Number, required: true },
    selectedSize: {
      type: String,
      enum: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
      required: true
    },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

export default cartItemSchema;
