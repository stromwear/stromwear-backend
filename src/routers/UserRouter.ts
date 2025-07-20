import express from "express";
import { validationResult,body } from "express-validator";
import { UserView } from "../models/users/userView";
import { IUser } from "../models/users/IUser";
import User from "../models/users/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config";
import AuthUser from "../middleWare/AuthUser";
import { OTPView } from "../models/otp/OTPView";
import { sendOTP } from "../utilities/mailer";
import { IOTP } from "../models/otp/IOTP";
import OTP from "../models/otp/OTP";
import { IOrder } from "../models/orders/IOrder";
import Order from "../models/orders/Order";
import { OrderView } from "../models/orders/OrderView";
const UserRouter:express.Router = express.Router();
UserRouter.post("/register",[
    body("firstName").not().isEmpty().withMessage("First Name can not left empty"),
    body("lastName").not().isEmpty().withMessage("Last Name can not left empty"),
    body("email").not().isEmpty().withMessage("Email can not left empty"),
    body("userName").not().isEmpty().withMessage("User Name can not left empty"),
    body("password").not().isEmpty().withMessage("Password can not left empty"),
    body("email").isEmail().withMessage("Invalid Email"),
],async(req:express.Request,res:express.Response)=>{
    let userData:UserView = {
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        userName:req.body.userName,
        password:req.body.password,
        isAdmin:false,
        errorMessage:req.body.errorMessage,
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
            if(token) {    
                userData = {} as UserView;
                userData.errorMessage = "logout in order to register new user";
                return res.status(400).json(userData);
            }
            else {
                let user:IUser | null = await User.findOne({
                    $or:[
                        {userName:userData.userName},
                        {email:userData.email}
                    ]
                });
                if(user) {
                    userData = {} as UserView;
                    userData.errorMessage = "user has already registered";
                    return res.status(400).json(userData);
                }
                else {
                    let otp:IOTP | null = await OTP.findOne({email:userData.email});
                    if(otp && otp.validation) {
                        let salt:string = await bcrypt.genSalt(10);
                        userData.password = await bcrypt.hash(userData.password,salt);
                        user = await new User(userData);
                        user.save();
                        userData = {} as UserView;
                        return res.status(200).json(userData);
                    }
                    else {
                        userData = {} as UserView;
                        userData.errorMessage = "varify your email";
                        return res.status(401).json(userData);
                    }
                }
            }
        }
    }
    catch(err) {
        return res.status(500).json(err);
    }
});
UserRouter.post("/login",[
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
                        if(user.isAdmin) {
                            userData = {} as UserView;
                                userData.errorMessage = "You have to login at admins page";
                                return res.status(401).json(userData);
                            }
                        else if(config.CLIENT_SECRET_KEY) {
                            let token:string = jwt.sign(payLoad,config.CLIENT_SECRET_KEY);
                            user = await User.findOneAndUpdate({userName:user.userName},{lastLogIn:new Date()});
                            userData = {} as UserView;
                            res.cookie("token", token, {httpOnly: true,sameSite: 'none',secure: true,domain: '.stromwear.in',path: '/',maxAge: 1000 * 60 * 60 * 24 * 30,}); 
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
UserRouter.get("/me",AuthUser,async(req:express.Request,res:express.Response)=>{
    try {
        let userData:UserView = req.body.userData;
        return res.status(200).json(userData);
    }
    catch(err) {
        return res.status(500).json(err);
    }
});
UserRouter.get("/orders",AuthUser,async(req:express.Request,res:express.Response)=>{
    try {
        const userData:UserView = req.body.userData;
        const orders:IOrder[] = await (await Order.find({ userName: userData.userName }).lean()).reverse();
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
            pinCode:order.pinCode,
            paymentMode:order.paymentMode,
            status: order.status,
            trackingId:order.trackingId,
            mobile: order.mobile,
            address: order.address
        }));
        return res.status(200).json(ordersData);
    }
    catch(err) {
        return res.status(500).json(err);
    }
})
UserRouter.get("/logout",AuthUser,async(req:express.Request,res:express.Response)=>{
    try {
        res.clearCookie("token");
        return res.status(200).json({});
    }
    catch(err) {
        return res.status(500).json(err);
    }
});
function generatePassword(length: number): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '123456789'; 
  const allChars = lowercase + uppercase + digits;
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomChar = allChars.charAt(Math.floor(Math.random() * allChars.length));
    password += randomChar;
  }
  return password;
}
UserRouter.post("/get-otp", async (req: express.Request, res: express.Response) => {
    try {
        let OTPData:OTPView = {
            email: req.body.email,
            password: "",
            lastSent:new Date(),
            validation:false,
            errorMessage: "",
        };
        let userName:string = req.body.userName;
        if(userName=="") {
            OTPData.errorMessage = "user name cant left empty";
            return res.status(400).json(OTPData);
        }
        if (!OTPData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(OTPData.email)) {
            OTPData.errorMessage = "Invalid Email";
            return res.status(400).json(OTPData);
        }
        const user:IUser | null = await User.findOne({userName});
        if(user) {
            OTPData.errorMessage = "username already exist";
            return res.status(400).json(OTPData);
        }
        OTPData.password = generatePassword(6);
        await sendOTP(OTPData.email, OTPData.password);
        let salt = await bcrypt.genSalt(10);
        OTPData.password = await bcrypt.hash(OTPData.password,salt);
        const otp:IOTP | null = await OTP.findOne({email:OTPData.email});
        if(otp) {
            await OTP.findOneAndUpdate({email:OTPData.email},OTPData);
        }
        else {
            const newOTP = await new OTP(OTPData);
            newOTP?.save();
        }
        return res.status(200).json({});
    } catch (err) {
        return res.status(500).json({ error: err });
    }
});
UserRouter.patch("/validate-otp",async(req:express.Request,res:express.Response)=>{
    try {
        let OTPData:OTPView = {
            email:req.body.email,
            password:req.body.password,
            lastSent:new Date(),
            validation:false,
            errorMessage:"",
        }
        const otp:IOTP | null = await OTP.findOne({email:OTPData.email});
        if(otp) {
            if (otp.lastSent) {
                const expiry = new Date(otp.lastSent.getTime() + 5 * 60 * 1000);
                if (OTPData.lastSent > expiry) {
                    OTPData = {} as OTPView;
                    OTPData.errorMessage = "OTP expired";
                    return res.status(401).json(OTPData);
                }
                else 
                {
                    if(await bcrypt.compare(OTPData.password,otp.password)) {
                        await OTP.findOneAndUpdate({email:OTPData.email},{validation:true});
                        return res.status(200).json({});
                    }
                    else {
                        OTPData = {} as OTPView;
                        OTPData.errorMessage = "Invalid OTP";
                        return res.status(401).json(OTPData);
                    }
                }
            }
        }
        else {
            OTPData = {} as OTPView;
            OTPData.errorMessage = "email not exist";
            return res.status(401).json(OTPData);
        }
    }
    catch(err) {
        return res.status(500).json(err);
    }
});
export default UserRouter;