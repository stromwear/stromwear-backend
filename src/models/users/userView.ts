export interface UserView {
    firstName:string,
    lastName:string,
    email:string,
    userName:string,
    password:string,
    isAdmin:boolean,
    lastLogIn: Date | null,
    errorMessage:string
}