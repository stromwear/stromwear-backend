"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/users/User"));
const AuthUser = async (req, res, next) => {
    let userData = {};
    try {
        let token = await req.cookies["token"];
        if (token) {
            if (config_1.default.CLIENT_SECRET_KEY) {
                let payLoad = jsonwebtoken_1.default.verify(token, config_1.default.CLIENT_SECRET_KEY);
                if (typeof payLoad !== "string") {
                    let user = await User_1.default.findOne({
                        firstName: payLoad.firstName,
                        lastName: payLoad.lastName,
                        email: payLoad.email
                    });
                    if (user) {
                        userData = {
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            userName: user.userName,
                            password: "",
                            isAdmin: false,
                            errorMessage: "",
                            lastLogIn: user.lastLogIn
                        };
                        req.body.userData = userData;
                        next();
                    }
                    else {
                        res.clearCookie("token");
                        userData = {};
                        userData.errorMessage = "User not found";
                        return res.status(404).json(userData);
                    }
                }
                else {
                    return res.status(401).json({ errorMessage: "Unauthorized" });
                }
            }
            else {
                userData = {};
                userData.errorMessage = "Something went wrong. Our team has been notified and is working on a fix.";
                return res.status(500).json(userData);
            }
        }
        else {
            userData = {};
            userData.errorMessage = "You have not logedin";
            return res.status(401).json(userData);
        }
    }
    catch (err) {
        return res.status(500).json(err);
    }
};
exports.default = AuthUser;
//# sourceMappingURL=AuthUser.js.map