import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';

export interface IWithdrawRequest {
  vendor: ObjectId | IUser;
  amount: Number;
  status: 'pending' | 'approved' | 'rejected';
  region: string;
  bankDetails: ObjectId;
}

export type IWithdrawRequestModules = Model<
  IWithdrawRequest,
  Record<string, unknown>
>;
