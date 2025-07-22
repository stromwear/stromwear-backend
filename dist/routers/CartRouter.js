"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Cart_1 = __importDefault(require("./../models/cart/Cart"));
const Item_1 = __importDefault(require("./../models/items/Item"));
const mongoose_1 = __importDefault(require("mongoose"));
const AuthUser_1 = __importDefault(require("../middleWare/AuthUser"));
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const Order_1 = __importDefault(require("../models/orders/Order"));
const CartRouter = express_1.default.Router();
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const razorpay = new razorpay_1.default({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});
CartRouter.post("/add-to-cart", AuthUser_1.default, async (req, res) => {
    try {
        const userName = req.body.userData?.userName;
        const itemId = req.body.itemId;
        const selectedSize = req.body.selectedSize;
        const quantity = req.body.quantity;
        if (!userName || !itemId || !selectedSize || !quantity) {
            return res.status(400).json({ errorMessage: "All fields are required" });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ errorMessage: "Invalid item ID" });
        }
        const item = await Item_1.default.findById(itemId);
        if (!item) {
            return res.status(404).json({ errorMessage: "Item not found" });
        }
        let cart = await Cart_1.default.findOne({ userName });
        if (!cart) {
            cart = new Cart_1.default({ userName, items: [{ itemId, price: item.price, selectedSize, quantity, image: item.image }] });
        }
        else {
            const existingItem = cart.items.find(i => i.itemId.toString() === itemId && i.selectedSize === selectedSize);
            if (existingItem) {
                const availableItem = await Item_1.default.findById(itemId);
                if (availableItem) {
                    const sizeQty = availableItem.size[selectedSize] ?? 0;
                    if (sizeQty >= existingItem.quantity + quantity) {
                        existingItem.quantity = Math.max(1, existingItem.quantity + quantity);
                    }
                    else {
                        return res.status(400).json({ errorMessage: "Not enough quantity available for selected size" });
                    }
                }
            }
            else {
                cart.items.push({ itemId, price: item.price, selectedSize, quantity, image: item.image });
            }
        }
        await cart.save();
        const cartView = {
            userName: cart.userName,
            items: cart.items.map(i => ({
                itemId: i.itemId,
                price: i.price,
                selectedSize: i.selectedSize,
                quantity: i.quantity,
                image: `data:image/webp;base64,${i.image.toString("base64")}`
            }))
        };
        return res.status(200).json(cartView);
    }
    catch (err) {
        return res.status(500).json({ error: err instanceof Error ? err.message : "unknown error" });
    }
});
CartRouter.get("/get-cart-items", AuthUser_1.default, async (req, res) => {
    try {
        const userName = req.body.userData?.userName;
        let cart = await Cart_1.default.findOne({ userName: userName }).lean();
        if (cart) {
            const cartData = {
                userName: cart.userName,
                items: cart.items.map(i => ({
                    itemId: i.itemId,
                    price: i.price,
                    selectedSize: i.selectedSize,
                    quantity: i.quantity,
                    image: `data:image/webp;base64,${i.image.toString("base64")}`
                }))
            };
            return res.status(200).json(cartData);
        }
        else {
            return res.status(200).json({});
        }
    }
    catch (err) {
        return res.status(500).json({ error: err instanceof Error ? err.message : "unknown error" });
    }
});
CartRouter.put('/remove-item', AuthUser_1.default, async (req, res) => {
    try {
        const { itemId } = req.body;
        const userName = req.body.userData.userName;
        const result = await Cart_1.default.updateOne({ userName }, { $pull: { items: { itemId } } });
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Item not found in cart" });
        }
        return res.status(200).json({ message: "Item removed" });
    }
    catch (err) {
        return res.status(500).json({ message: "Error removing item", error: err });
    }
});
CartRouter.patch('/clear-cart', AuthUser_1.default, async (req, res) => {
    try {
        const { userName } = req.body.userData;
        if (userName) {
            const cart = await Cart_1.default.findOneAndDelete({ userName: userName });
            if (cart) {
                return res.status(200).json({});
            }
            else {
                return res.status(500).json({ errorMessage: "can not clear" });
            }
        }
        else {
            return res.status(401).json({ errorMessage: "no access" });
        }
    }
    catch (err) {
        return res.status(500).json({ error: err instanceof Error ? err.message : "unknown error" });
    }
});
CartRouter.post("/create-order", async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount,
            currency: "INR",
            receipt: "order_" + Date.now(),
        };
        const order = await razorpay.orders.create(options);
        return res.json({ order });
    }
    catch (err) {
        return res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
CartRouter.post("/verify-payment", async (req, res) => {
    try {
        const { order_id, payment_id, signature, pinCode, userData, mobile, address } = req.body;
        let Status = "captured";
        if (!RAZORPAY_KEY_SECRET) {
            Status = "failed";
        }
        if (RAZORPAY_KEY_SECRET) {
            const expectedSignature = crypto_1.default.createHmac("sha256", RAZORPAY_KEY_SECRET).update(order_id + "|" + payment_id).digest("hex");
            if (expectedSignature !== signature) {
                Status = "failed";
            }
        }
        const userName = userData?.userName;
        if (!userName) {
            Status = "failed";
        }
        const cart = await Cart_1.default.findOne({ userName });
        if (!cart || cart.items.length === 0) {
            Status = "failed";
            await Order_1.default.create({
                userName,
                orderId: order_id,
                paymentId: payment_id,
                mobile: mobile,
                address: address,
                paymentMode: "online",
                pinCode: pinCode,
                items: [],
                amount: 0,
                status: Status,
            });
        }
        else {
            await Order_1.default.create({
                userName,
                orderId: order_id,
                paymentId: payment_id,
                mobile: mobile,
                address: address,
                pinCode: pinCode,
                paymentMode: "online",
                items: cart.items,
                amount: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
                status: Status,
            });
        }
        if (Status != "captured") {
            return res.status(500).json({ errorMessage: "payment fail" });
        }
        return res.status(200).json({ errorMessage: "" });
    }
    catch (err) {
        return res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
CartRouter.post("/place-cod-order", AuthUser_1.default, async (req, res) => {
    try {
        const { userData, mobile, address, pinCode } = req.body;
        const userName = userData?.userName;
        if (!userName) {
            return res.status(401).json({ errorMessage: "Login to place order" });
        }
        else {
            const cart = await Cart_1.default.findOne({ userName });
            if (!cart || cart.items.length === 0) {
                return res.status(401).json({ errorMessage: "Your cart is empty" });
            }
            else {
                await Order_1.default.create({
                    userName,
                    orderId: "order_" + Date.now(),
                    paymentId: "",
                    mobile: mobile,
                    address: address,
                    pinCode: pinCode,
                    paymentMode: "COD",
                    items: cart.items,
                    amount: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
                    status: "captured",
                });
                return res.status(200).json({});
            }
        }
    }
    catch (err) {
        return res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
exports.default = CartRouter;
//# sourceMappingURL=CartRouter.js.map