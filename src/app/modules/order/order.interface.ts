import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';
import { IProducts } from '../products/products.interface';
interface IItems {
  product: ObjectId | IProducts;
  price: number;
  quantity: number;
  discount?: number;
}
export interface IOrder {
  id: string;
  user: ObjectId | IUser;
  author: ObjectId | IUser;
  product: ObjectId | IProducts;
  totalPrice: number;
  discount: number;
  quantity: number;
  items: IItems[];
  tnxId: string;
  status: 'pending' | 'ongoing' | 'cancelled' | 'delivered';
  isPaid: boolean;
  billingDetails: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  isDeleted: boolean;
}

export type IOrderModules = Model<IOrder, Record<string, unknown>>;
