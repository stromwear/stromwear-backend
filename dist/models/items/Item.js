"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const itemSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    size: {
        S: { type: Number, default: 0 },
        M: { type: Number, default: 0 },
        L: { type: Number, default: 0 },
        XL: { type: Number, default: 0 },
        XXL: { type: Number, default: 0 },
        XXXL: { type: Number, default: 0 },
    },
    price: { type: Number, required: true },
    image: { type: Buffer, required: true },
    image1: { type: Buffer, required: true },
    image2: { type: Buffer, required: true },
    image3: { type: Buffer, required: true },
    actualPrice: { type: Number, require: true },
    fabric: { type: String }
});
exports.default = mongoose_1.default.model("items", itemSchema);
//# sourceMappingURL=Item.js.map