"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("./config"));
const mongoose_1 = __importDefault(require("mongoose"));
const UserRouter_1 = __importDefault(require("./routers/UserRouter"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const AmdinRoutes_1 = __importDefault(require("./routers/AmdinRoutes"));
const Item_1 = __importDefault(require("./models/items/Item"));
const CartRouter_1 = __importDefault(require("./routers/CartRouter"));
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: "2mb" }));
app.use((0, cors_1.default)({
    origin: ['https://stromwear.in', 'https://www.stromwear.in'],
    credentials: true,
}));
app.use("/api/users", UserRouter_1.default);
app.use("/api/admins", AmdinRoutes_1.default);
app.use("/api/cart", CartRouter_1.default);
if (config_1.default.MONGO_DB_URL) {
    mongoose_1.default.connect(config_1.default.MONGO_DB_URL).then((res) => {
        console.log("mongo db connected");
    }).catch((err) => {
        console.log("error in mongodb connection");
    });
}
app.get("/", (req, res) => {
    return res.status(200).json({
        "msg": "server is running"
    });
});
app.get("/get-items", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const items = await Item_1.default.find().sort({ _id: -1 }).skip((page - 1) * 4).limit(4).lean();
        const itemsData = items.map((e) => ({
            itemId: e._id,
            name: e.name,
            size: {
                S: e.size.S,
                M: e.size.M,
                L: e.size.L,
                XL: e.size.XL,
                XXL: e.size.XXL,
                XXXL: e.size.XXXL
            },
            price: e.price,
            actualPrice: e.actualPrice,
            image: `data:image/webp;base64,${e.image.toString("base64")}`,
            image1: '',
            image2: '',
            image3: '',
            fabric: e.fabric,
            errorMessage: ""
        }));
        return res.status(200).json(itemsData);
    }
    catch (err) {
        return res.status(500).json(err);
    }
});
app.get("/api/items/:ItemID", async (req, res) => {
    try {
        const items = await Item_1.default.findById(req.params.ItemID);
        if (items) {
            const itemData = {
                itemId: items._id,
                name: items.name,
                size: {
                    S: items.size.S,
                    M: items.size.M,
                    L: items.size.L,
                    XL: items.size.XL,
                    XXL: items.size.XXL,
                    XXXL: items.size.XXXL
                },
                price: items.price,
                actualPrice: items.actualPrice,
                image: `data:image/webp;base64,${items.image.toString("base64")}`,
                image1: `data:image/webp;base64,${items.image1.toString("base64")}`,
                image2: `data:image/webp;base64,${items.image2.toString("base64")}`,
                image3: `data:image/webp;base64,${items.image3.toString("base64")}`,
                fabric: items.fabric,
                errorMessage: "",
            };
            return res.status(200).json(itemData);
        }
        else {
            return res.status(404).json({ errorMessage: "Product not found" });
        }
    }
    catch (err) {
        return res.status(500).json(err);
    }
});
app.get("/get-all-item-ids", async (req, res) => {
    try {
        const ids = await Item_1.default.find({}, { _id: 1 }).lean();
        const productIds = ids.map((item) => item._id.toString());
        return res.status(200).json(productIds);
    }
    catch (err) {
        return res.status(500).json(err);
    }
});
if (config_1.default.PORT) {
    app.listen(config_1.default.PORT, () => {
        console.log("server started");
    });
}
//# sourceMappingURL=server.js.map