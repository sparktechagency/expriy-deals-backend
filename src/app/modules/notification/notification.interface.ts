import { ObjectId } from 'mongodb';
export enum modeType {
  Payments = 'Payments',
  WithdrawRequest = 'WithdrawRequest',
  Order = 'Order',
  VendorRequest = 'VendorRequest',
}
export interface TNotification {
  receiver: ObjectId;
  message: string;
  description?: string;
  refference: ObjectId;
  model_type: modeType;
  date?: Date;
  read: boolean;
  isDeleted: boolean;
}
