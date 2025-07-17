import { Document } from "mongoose"
export interface IUser extends Document {
    firstName:string,
    lastName:string,
    email:string,
    userName:string,
    password:string,
    isAdmin:boolean,
    lastLogIn: Date,
}