"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/users/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const AuthUser_1 = __importDefault(require("../middleWare/AuthUser"));
const mailer_1 = require("../utilities/mailer");
const OTP_1 = __importDefault(require("../models/otp/OTP"));
const Order_1 = __importDefault(require("../models/orders/Order"));
const UserRouter = express_1.default.Router();
UserRouter.post("/register", [
    (0, express_validator_1.body)("firstName").not().isEmpty().withMessage("First Name can not left empty"),
    (0, express_validator_1.body)("lastName").not().isEmpty().withMessage("Last Name can not left empty"),
    (0, express_validator_1.body)("email").not().isEmpty().withMessage("Email can not left empty"),
    (0, express_validator_1.body)("userName").not().isEmpty().withMessage("User Name can not left empty"),
    (0, express_validator_1.body)("password").not().isEmpty().withMessage("Password can not left empty"),
    (0, express_validator_1.body)("email").isEmail().withMessage("Invalid Email"),
], async (req, res) => {
    let userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        userName: req.body.userName,
        password: req.body.password,
        isAdmin: false,
        errorMessage: req.body.errorMessage,
        lastLogIn: null,
    };
    try {
        let errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            userData = {};
            const errorArray = errors.array();
            userData.errorMessage = errorArray.length > 0 ? errorArray[0].msg : "Validation error";
            return res.status(400).json(userData);
        }
        else {
            let token = await req.cookies["token"];
            if (token) {
                userData = {};
                userData.errorMessage = "logout in order to register new user";
                return res.status(400).json(userData);
            }
            else {
                let user = await User_1.default.findOne({
                    $or: [
                        { userName: userData.userName },
                        { email: userData.email }
                    ]
                });
                if (user) {
                    userData = {};
                    userData.errorMessage = "user has already registered";
                    return res.status(400).json(userData);
                }
                else {
                    let otp = await OTP_1.default.findOne({ email: userData.email });
                    if (otp && otp.validation) {
                        let salt = await bcryptjs_1.default.genSalt(10);
                        userData.password = await bcryptjs_1.default.hash(userData.password, salt);
                        user = await new User_1.default(userData);
                        user.save();
                        userData = {};
                        return res.status(200).json(userData);
                    }
                    else {
                        userData = {};
                        userData.errorMessage = "varify your email";
                        return res.status(401).json(userData);
                    }
                }
            }
        }
    }
    catch (err) {
        return res.status(500).json(err);
    }
});
UserRouter.post("/login", [
    (0, express_validator_1.body)("userName").not().isEmpty().withMessage("User Name can not left empty"),
    (0, express_validator_1.body)("password").not().isEmpty().withMessage("Password can not left empty"),
], async (req, res) => {
    let userData = {
        firstName: "",
        lastName: "",
        email: "",
        userName: req.body.userName,
        password: req.body.password,
        errorMessage: "",
        isAdmin: false,
        lastLogIn: null,
    };
    try {
        const captchaToken = req.body.captchaToken;
        if (!captchaToken) {
            userData = {};
            userData.errorMessage = "Captcha is required";
            return res.status(400).json(userData);
        }
        let errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            userData = {};
            const errorArray = errors.array();
            userData.errorMessage = errorArray.length > 0 ? errorArray[0].msg : "Validation error";
            return res.status(400).json(userData);
        }
        else {
            const captchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    secret: process.env.RECAPTCHA_SECRET_KEY || "",
                    response: captchaToken,
                }).toString(),
            });
            const captchaData = await captchaRes.json();
            if (!captchaData.success) {
                userData = {};
                userData.errorMessage = "Captcha verification failed";
                return res.status(400).json(userData);
            }
            let token = await req.cookies["token"];
            let adminToken = await req.cookies["adminToken"];
            if (token || adminToken) {
                userData = {};
                userData.errorMessage = "you have already loged in";
                return res.status(400).json(userData);
            }
            else {
                let user = await User_1.default.findOne({ $or: [{ userName: userData.userName }, { email: userData.userName }] });
                if (user) {
                    if (await bcryptjs_1.default.compare(userData.password, user.password)) {
                        let payLoad = {
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                        };
                        if (user.isAdmin) {
                            userData = {};
                            userData.errorMessage = "You have to login at admins page";
                            return res.status(401).json(userData);
                        }
                        else if (config_1.default.CLIENT_SECRET_KEY) {
                            let token = jsonwebtoken_1.default.sign(payLoad, config_1.default.CLIENT_SECRET_KEY);
                            user = await User_1.default.findOneAndUpdate({ userName: user.userName }, { lastLogIn: new Date() });
                            userData = {};
                            res.cookie("token", token, { httpOnly: true, sameSite: 'none', secure: true, domain: '.stromwear.in', path: '/', maxAge: 1000 * 60 * 60 * 24 * 30, });
                            return res.status(200).json(userData);
                        }
                        else {
                            userData = {};
                            userData.errorMessage = "Something went wrong. Our team has been notified and is working on a fix.";
                            return res.status(500).json(userData);
                        }
                    }
                    else {
                        userData = {};
                        userData.errorMessage = "Invalid Password";
                        return res.status(400).json(userData);
                    }
                }
                else {
                    userData = {};
                    userData.errorMessage = "Username or email dose not exist";
                    return res.status(400).json(userData);
                }
            }
        }
    }
    catch (err) {
        return res.status(500).json(err);
    }
});
UserRouter.get("/me", AuthUser_1.default, async (req, res) => {
    try {
        let userData = req.body.userData;
        return res.status(200).json(userData);
    }
    catch (err) {
        return res.status(500).json(err);
    }
});
UserRouter.get("/orders", AuthUser_1.default, async (req, res) => {
    try {
        const userData = req.body.userData;
        const orders = await (await Order_1.default.find({ userName: userData.userName }).lean()).reverse();
        if (!orders || orders.length === 0) {
            return res.status(200).json([]);
        }
        const ordersData = orders.map(order => ({
            userName: order.userName,
            orderId: order.orderId,
            paymentId: order.paymentId,
            items: order.items.map(item => ({
                ...item,
                image: `data:image/webp;base64,${item.image.toString("base64")}`
            })),
            amount: order.amount,
            pinCode: order.pinCode,
            paymentMode: order.paymentMode,
            status: order.status,
            trackingId: order.trackingId,
            mobile: order.mobile,
            address: order.address
        }));
        return res.status(200).json(ordersData);
    }
    catch (err) {
        return res.status(500).json(err);
    }
});
UserRouter.get("/logout", AuthUser_1.default, async (req, res) => {
    try {
        res.clearCookie("token", { httpOnly: true, sameSite: "none", secure: true, domain: ".stromwear.in", path: "/", });
        return res.status(200).json({ message: "Logged out" });
    }
    catch (err) {
        return res.status(500).json(err);
    }
});
function generatePassword(length) {
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
UserRouter.post("/get-otp", async (req, res) => {
    try {
        let OTPData = {
            email: req.body.email,
            password: "",
            lastSent: new Date(),
            validation: false,
            errorMessage: "",
        };
        let userName = req.body.userName;
        if (userName == "") {
            OTPData.errorMessage = "user name cant left empty";
            return res.status(400).json(OTPData);
        }
        if (!OTPData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(OTPData.email)) {
            OTPData.errorMessage = "Invalid Email";
            return res.status(400).json(OTPData);
        }
        const user = await User_1.default.findOne({ userName });
        if (user) {
            OTPData.errorMessage = "username already exist";
            return res.status(400).json(OTPData);
        }
        OTPData.password = generatePassword(6);
        await (0, mailer_1.sendOTP)(OTPData.email, OTPData.password);
        let salt = await bcryptjs_1.default.genSalt(10);
        OTPData.password = await bcryptjs_1.default.hash(OTPData.password, salt);
        const otp = await OTP_1.default.findOne({ email: OTPData.email });
        if (otp) {
            await OTP_1.default.findOneAndUpdate({ email: OTPData.email }, OTPData);
        }
        else {
            const newOTP = await new OTP_1.default(OTPData);
            newOTP?.save();
        }
        return res.status(200).json({});
    }
    catch (err) {
        return res.status(500).json({ error: err });
    }
});
UserRouter.patch("/validate-otp", async (req, res) => {
    try {
        let OTPData = {
            email: req.body.email,
            password: req.body.password,
            lastSent: new Date(),
            validation: false,
            errorMessage: "",
        };
        const otp = await OTP_1.default.findOne({ email: OTPData.email });
        if (otp) {
            if (otp.lastSent) {
                const expiry = new Date(otp.lastSent.getTime() + 5 * 60 * 1000);
                if (OTPData.lastSent > expiry) {
                    OTPData = {};
                    OTPData.errorMessage = "OTP expired";
                    return res.status(401).json(OTPData);
                }
                else {
                    if (await bcryptjs_1.default.compare(OTPData.password, otp.password)) {
                        await OTP_1.default.findOneAndUpdate({ email: OTPData.email }, { validation: true });
                        return res.status(200).json({});
                    }
                    else {
                        OTPData = {};
                        OTPData.errorMessage = "Invalid OTP";
                        return res.status(401).json(OTPData);
                    }
                }
            }
        }
        else {
            OTPData = {};
            OTPData.errorMessage = "email not exist";
            return res.status(401).json(OTPData);
        }
    }
    catch (err) {
        return res.status(500).json(err);
    }
});
UserRouter.patch("/reset-password", async (req, res) => {
    try {
        let passwordData = {
            otp: req.body.otp,
            newPassword: req.body.password,
            email: req.body.email,
            lastSent: new Date(),
        };
        const otp = await OTP_1.default.findOne({ email: passwordData.email });
        if (otp) {
            if (otp.lastSent) {
                const expiry = new Date(otp.lastSent.getTime() + 2 * 60 * 1000);
                if (passwordData.lastSent > expiry) {
                    return res.status(500).json({ errorMessage: "OTP Expired" });
                }
                else {
                    if (await bcryptjs_1.default.compare(passwordData.otp, otp.password)) {
                        await OTP_1.default.findOneAndUpdate({ email: passwordData.email }, { validation: true });
                        const salt = await bcryptjs_1.default.genSalt(10);
                        passwordData.newPassword = await bcryptjs_1.default.hash(passwordData.newPassword, salt);
                        await User_1.default.findOneAndUpdate({ email: passwordData.email }, { password: passwordData.newPassword });
                        return res.status(200).json({});
                    }
                    else {
                        return res.status(500).json({ errorMessage: "Invalid OTP" });
                    }
                }
            }
        }
    }
    catch (err) {
        return res.status(500).json({ error: err });
    }
});
exports.default = UserRouter;
//# sourceMappingURL=UserRouter.js.map