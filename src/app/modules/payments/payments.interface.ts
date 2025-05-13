import { Model, ObjectId } from 'mongoose';

export interface IPayments {
  user: ObjectId;
  author: ObjectId;
  order: ObjectId;
  status: 'pending' | 'paid' | 'refunded';
  deliveryStatus: 'pending' | 'ongoing' | 'picUp' | 'shifted' | 'delivered';
  trnId: string;
  price: number;
  isDeleted: boolean;
  cardInfo: {
    cardNumber: string;
    expiryDate: string;
    cardCode: string;
    firstName: string;
    lastName: string;
  };
}

export type IPaymentsModules = Model<IPayments, Record<string, unknown>>;
