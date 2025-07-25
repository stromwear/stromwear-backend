import express from "express";
import { IUser } from "../models/users/IUser";
import User from "../models/users/User";
import { UserView } from "../models/users/userView";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import config from "../config";
import jwt from "jsonwebtoken";
import AuthAdmin from "../middleWare/AuthAdmin";
import { ItemView } from "../models/items/itemView";
import { IItem } from "../models/items/IITems";
import Item from "../models/items/Item";
import { Types } from "mongoose";
import { IOrder } from "../models/orders/IOrder";
import Order from "../models/orders/Order";
import { OrderView } from "../models/orders/OrderView";
const AdminRouter:express.Router = express.Router();
AdminRouter.post("/login",[
    body("userName").not().isEmpty().withMessage("User Name can not left empty"),
    body("password").not().isEmpty().withMessage("Password can not left empty"),
],async(req:express.Request,res:express.Response)=>{
    let userData:UserView = {
        firstName:"",
        lastName:"",
        email:"",
        userName:req.body.userName,
        password:req.body.password,
        errorMessage:"",
        isAdmin:false,
        lastLogIn:null,
    }
    try {
        let errors = validationResult(req);
        if(!errors.isEmpty()) {
            userData = {} as UserView;
            const errorArray = errors.array();
            userData.errorMessage = errorArray.length > 0 ? errorArray[0].msg : "Validation error";
            return res.status(400).json(userData);
        }
        else {
            let token = await req.cookies["token"];
            let adminToken = await req.cookies["adminToken"];
            if(token || adminToken) {    
                userData = {} as UserView;
                userData.errorMessage = "you have already loged in";
                return res.status(400).json(userData);
            }
            else {
                let user:IUser | null = await User.findOne({$or: [{ userName: userData.userName },{ email: userData.userName }]});
                if(user) {
                    if(await bcrypt.compare(userData.password,user.password)) {
                        let payLoad = {
                            firstName:user.firstName,
                            lastName:user.lastName,
                            email:user.email,
                        }
                        if(!user.isAdmin) {
                            userData = {} as UserView;
                            userData.errorMessage = "You have no access to this service";
                            return res.status(401).json(userData);
                        }
                        if(config.ADMIN_SECRET_KEY) {
                            let token:string = jwt.sign(payLoad,config.ADMIN_SECRET_KEY);
                            user = await User.findOneAndUpdate({userName:user.userName},{lastLogIn:new Date()});
                            userData = {} as UserView;
                            res.cookie("adminToken", token, {httpOnly: true,sameSite: 'none',secure: true,domain: '.stromwear.in',path: '/',maxAge: 1000 * 60 * 60 * 24 * 30,});   
                            return res.status(200).json(userData);
                        }
                        else {
                            userData = {} as UserView;
                            userData.errorMessage = "Something went wrong. Our team has been notified and is working on a fix.";
                            return res.status(500).json(userData);
                        }
                    }
                    else {
                        userData = {} as UserView;
                        userData.errorMessage = "Invalid Password";
                        return res.status(400).json(userData);
                    }
                }
                else {
                    userData = {} as UserView;
                    userData.errorMessage = "Username or email dose not exist";
                    return res.status(400).json(userData);
                }
            }
        }
    }
    catch(err) {
        return res.status(500).json(err);
    }
});
AdminRouter.delete("/delete-prduct",AuthAdmin,async(req:express.Request,res:express.Response)=>{
    try {
        const {productId} = req.body;
        if(productId==="") {
            return res.status(500).json({errorMessage:"Product Id cant left empty"});
        }
        else {
            await Item.findByIdAndDelete(productId);
            return res.status(200).json({});
        }
    }
    catch(err) {
        return res.status(500).json(err);
    }
})
AdminRouter.get('/orders',AuthAdmin,async(req:express.Request,res:express.Response)=>{
    try {
        const page = parseInt(req.query.page as string) || 1;
        const orders: IOrder[] = await Order.find().sort({ _id: -1 }).lean().skip((page - 1) * 4).limit(4);
        if (!orders || orders.length === 0) {
            return res.status(200).json([]);
        }
        const ordersData:OrderView[] = orders.map(order => ({
            userName: order.userName,
            orderId: order.orderId,
            paymentId:order.paymentId,
            items: order.items.map(item => ({
                ...item,
                image: `data:image/webp;base64,${item.image.toString("base64")}`
            })),
            amount: order.amount,
            status: order.status,
            paymentMode:order.paymentMode,
            pinCode:order.pinCode,
            trackingId: order.trackingId,
            mobile: order.mobile,
            address: order.address
        }));
        return res.status(200).json(ordersData);
    }
    catch(err) {
        return res.status(500).json(err);
    }
});
AdminRouter.patch("/dispatch",AuthAdmin,async(req:express.Request,res:express.Response)=>{
    try {
        const {orderId,trackingId} = req.body;
        if(orderId) {
            const order:IOrder | null = await Order.findOneAndUpdate({ orderId: orderId },{ $set: { status: "dispatched", trackingId: trackingId } },{ new: true });
            return res.status(200).json({});
        }
        else {
            return res.status(401).json({errorMessage:"invalid order id"})
        }
    }
    catch(err) {
        return res.status(500).json(err);
    }   
});
AdminRouter.post("/upload",AuthAdmin,
    body("name").not().isEmpty().withMessage("Name can not left empty"),    
    body("price").not().isEmpty().withMessage("Price can not left empty"),  
    body("actualPrice").not().isEmpty().withMessage("Need to enter actual price"),  
    body("image").not().isEmpty().withMessage("Imaage can not left can not left empty"),   
async(req:express.Request,res:express.Response)=>{
    try {
        let itemData: ItemView = {
            itemId: '' as unknown as Types.ObjectId,
            name: req.body.name,
            size: {
            S: req.body.size.S,
            M: req.body.size.M,
            L: req.body.size.L,
            XL: req.body.size.XL,
            XXL: req.body.size.XXL,
            XXXL: req.body.size.XXXL
            },
            actualPrice:req.body.actualPrice,
            price: req.body.price,
            image: req.body.image,
            image1: req.body.image1,
            image2: req.body.image2,
            image3: req.body.image3,
            fabric: req.body.fabric
        }
        let errors = validationResult(req);
        if(!errors.isEmpty()) {
            itemData = {} as ItemView;
            const errorArray = errors.array();
            itemData.errorMessage = errorArray.length > 0 ? errorArray[0].msg : "Validation error";
            return res.status(400).json(itemData);
        }
        else {
            if (!itemData.image.startsWith('data:image/webp;base64,')) {
                itemData = {} as ItemView;
                itemData.errorMessage = "Only JPG or WebP images are allowed";
                return res.status(400).json(itemData);
            }
            else {
                let base64Data = itemData.image.replace(/^data:image\/webp;base64,/, "");
                let base64Data1 = itemData.image1.replace(/^data:image\/webp;base64,/, "");
                let base64Data2 = itemData.image2.replace(/^data:image\/webp;base64,/, "");
                let base64Data3 = itemData.image3.replace(/^data:image\/webp;base64,/, "");
                const buffer = Buffer.from(base64Data, 'base64');
                const buffer1 = Buffer.from(base64Data1, 'base64');
                const buffer2 = Buffer.from(base64Data2, 'base64');
                const buffer3 = Buffer.from(base64Data3, 'base64');
                let item:IItem = await new Item({...itemData,image:buffer,image1:buffer1,image2:buffer2,image3:buffer3});
                item.save();
                itemData = {} as ItemView;
                return res.status(200).json(itemData);  
            }
        }
    }
    catch(err) {
        return res.status(500).json(err);
    }
});
AdminRouter.get("/items-list",AuthAdmin,async(req:express.Request,res:express.Response)=>{
    try {
        const page = parseInt(req.query.page as string) || 1;
        const items = await Item.find().skip((page - 1) * 4).limit(4);
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
            actualPrice:e.actualPrice,
            price: e.price,
            image: `data:image/webp;base64,${e.image.toString("base64")}`,
            image1: `data:image/webp;base64,${e.image1.toString("base64")}`,
            image2: `data:image/webp;base64,${e.image2.toString("base64")}`,
            image3: `data:image/webp;base64,${e.image3.toString("base64")}`,
            fabric: e.fabric,
            errorMessage: ""
        }));
        return res.status(200).json(itemsData);
    }
    catch(err) {
        return res.status(500).json(err);
    }
});
AdminRouter.get("/me",AuthAdmin,async(req:express.Request,res:express.Response)=>{
    try {
        let userData:UserView = req.body.userData;
        return res.status(200).json(userData);
    }
    catch(err) {
        return res.status(500).json(err);   
    }
});
AdminRouter.get("/logout", AuthAdmin, async (req, res) => {
  try {
    res.clearCookie("adminToken", {httpOnly: true,sameSite: "none",secure: true,domain: ".stromwear.in",path: "/",});
    return res.status(200).json({ message: "Logged out" });
  } 
  catch (err) {
    return res.status(500).json(err);
  }
});
export default AdminRouter;