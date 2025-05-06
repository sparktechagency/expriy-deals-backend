import { model, Schema } from 'mongoose';
import {
  IWithdrawRequest,
  IWithdrawRequestModules,
} from './withdrawRequest.interface';

const withdrawRequestSchema = new Schema<IWithdrawRequest>(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    region: {
      type: String,
    },
    bankDetails: {
      type: Schema.Types.ObjectId,
      ref: 'BankDetails',
      required: true,
    },
  },
  {
    timestamps: true,
  },
); 

const WithdrawRequest = model<IWithdrawRequest, IWithdrawRequestModules>(
  'WithdrawRequest',
  withdrawRequestSchema,
);
export default WithdrawRequest;
