import { CartItemView } from "../cart/CartView";
export interface OrderView {
  userName: string;
  orderId: string;
  paymentId: string;
  items: CartItemView[];
  amount: number;
  status:"captured" | "dispatched" | "failed";
  paymentMode:"online" | "COD";
  mobile: number;
  trackingId:string;
  pinCode:number;
  address: string;
  errorMessage?: string;
}
