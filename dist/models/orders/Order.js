"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const CartItemSchema_1 = __importDefault(require("../cart/CartItemSchema")); // reusable import
const orderSchema = new mongoose_1.Schema({
    userName: { type: String, required: true },
    orderId: { type: String, required: true },
    paymentId: { type: String, required: false },
    items: { type: [CartItemSchema_1.default], required: true },
    mobile: { type: Number, require: true },
    address: { type: String, require: true },
    trackingId: { type: String, default: "" },
    amount: { type: Number, required: true },
    pinCode: { type: Number, require: true },
    paymentMode: { type: String, enum: ["online", "COD"], require: true },
    status: { type: String, enum: ["captured", "dispatched", "failed"], require: true },
});
exports.default = mongoose_1.default.model("Order", orderSchema);
//# sourceMappingURL=Order.js.map