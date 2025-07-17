"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const cartItemSchema = new mongoose_1.Schema({
    itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Item", required: true },
    image: { type: Buffer, required: true },
    price: { type: Number, required: true },
    selectedSize: {
        type: String,
        enum: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        required: true
    },
    quantity: { type: Number, required: true, min: 1 }
}, { _id: false });
exports.default = cartItemSchema;
//# sourceMappingURL=CartItemSchema.js.map