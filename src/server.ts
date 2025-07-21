import express from "express";
import cors from "cors";
import config from "./config";
import mongoose from "mongoose";
import UserRouter from "./routers/UserRouter";
import cookieParser from "cookie-parser";
import AdminRouter from "./routers/AmdinRoutes";
import Item from "./models/items/Item";
import CartRouter from "./routers/CartRouter";
import { ItemView } from "./models/items/itemView";
import { Types } from "mongoose";
import { IItem } from "./models/items/IITems";
const app:express.Application = express();
app.use(cookieParser());
app.use(express.json({ limit: "150kb" }));
app.use(cors({
  origin: ['https://stromwear.in','https://www.stromwear.in'],
  credentials: true,
}));
app.use("/api/users",UserRouter);
app.use("/api/admins",AdminRouter);
app.use("/api/cart",CartRouter);
if(config.MONGO_DB_URL) {
    mongoose.connect(config.MONGO_DB_URL).then((res)=>{
        console.log("mongo db connected");
    }).catch((err)=>{
        console.log("error in mongodb connection");
    });
}
app.get("/",(req:express.Request, res:express.Response) => {
    return res.status(200).json({
        "msg":"server is running"
    });
});
app.get("/get-items", async (req: express.Request, res: express.Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const items = await Item.find().sort({ _id: -1 }).skip((page - 1) * 4).limit(4).lean();
        const itemsData: ItemView[] = items.map((e) => ({
            itemId: e._id as Types.ObjectId,
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
            actualPrice:e.actualPrice,
            image: `data:image/webp;base64,${e.image.toString("base64")}`,
            packOf: e.packOf,
            fabric: e.fabric,
            errorMessage: ""
        }));
        return res.status(200).json(itemsData);
    } catch (err) {
        return res.status(500).json(err);
    }
});
app.get("/api/items/:ItemID",async(req:express.Request,res:express.Response)=>{
    try {
        const items:IItem | null = await Item.findById(req.params.ItemID);
        if(items) {
            const itemData:ItemView = {
                itemId:items._id as Types.ObjectId,
                name:items.name,
                size:{
                    S:items.size.S,
                    M:items.size.M,
                    L:items.size.L,
                    XL:items.size.XL,
                    XXL:items.size.XXL,
                    XXXL:items.size.XXXL
                },
                price:items.price,
                actualPrice:items.actualPrice,
                image:`data:image/webp;base64,${items.image.toString("base64")}`,
                packOf:items.packOf,
                fabric:items.fabric,
                errorMessage:"",
            }
            return res.status(200).json(itemData);
        }
        else {
            return res.status(404).json({errorMessage:"Product not found"});
        }
    }
    catch(err) {
        return res.status(500).json(err);
    }
});
if(config.PORT) {
    app.listen(config.PORT,()=>{
        console.log("server started");
    })
}