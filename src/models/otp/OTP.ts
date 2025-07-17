import mongoose, { Schema } from "mongoose";
import { IOTP } from "./IOTP";
const OTPSchema = new Schema<IOTP>({
    email:{type:String,require:true},
    password:{type:String},
    lastSent:{type:Date,required:true},
    validation:{type:Boolean,default:false}
});
export default mongoose.model<IOTP>("OTP", OTPSchema);
