import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';
import { IOrder } from '../order/order.interface';

export interface IPayments {
  user: ObjectId | IUser;
  author: ObjectId | IUser;
  order: ObjectId | IOrder;
  status: 'pending' | 'paid' | 'refunded';
  deliveryStatus: 'pending' | 'ongoing' | 'picUp' | 'shifted' | 'delivered';
  trnId: string;
  adminAmount: number;
  vendorAmount: number;
  paymentIntentId: string;
  price: number;
  isDeleted: boolean;
}

export type IPaymentsModules = Model<IPayments, Record<string, unknown>>;
