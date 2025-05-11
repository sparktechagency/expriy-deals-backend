import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';
import { IBankDetails } from '../bankDetails/bankDetails.interface';

export interface IWithdrawRequest {
  vendor: ObjectId | IUser;
  amount: Number;
  status: 'pending' | 'approved' | 'rejected';
  region: string;
  bankDetails: ObjectId | IBankDetails;
  isDeleted: boolean;
}

export type IWithdrawRequestModules = Model<
  IWithdrawRequest,
  Record<string, unknown>
>;
