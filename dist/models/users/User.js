"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let userSchema = new mongoose_1.default.Schema({
    firstName: { type: String, require: true },
    lastName: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    userName: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    lastLogIn: { type: Date },
    isAdmin: { type: Boolean, default: false },
});
exports.default = mongoose_1.default.model("users", userSchema);
//# sourceMappingURL=User.js.map