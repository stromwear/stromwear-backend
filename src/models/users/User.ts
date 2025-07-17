import { Schema } from "mongoose";
import mongoose from "mongoose";
import { IUser } from "./IUser";

let userSchema: Schema = new mongoose.Schema({
    firstName: { type: String, require: true },
    lastName: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    userName: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    lastLogIn: { type: Date },
    isAdmin: {type:Boolean,default:false},
});
export default mongoose.model<IUser>("users",userSchema);