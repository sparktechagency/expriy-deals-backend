
import { model, Schema } from 'mongoose';
import { IWithdrawRequest, IWithdrawRequestModules } from './withdrawRequest.interface';

const withdrawRequestSchema = new Schema<IWithdrawRequest>(
  {
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  }
);

//withdrawRequestSchema.pre('find', function (next) {
//  //@ts-ignore
//  this.find({ isDeleted: { $ne: true } });
//  next();
//});

//withdrawRequestSchema.pre('findOne', function (next) {
  //@ts-ignore
  //this.find({ isDeleted: { $ne: true } });
 // next();
//});

withdrawRequestSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

const WithdrawRequest = model<IWithdrawRequest, IWithdrawRequestModules>(
  'WithdrawRequest',
  withdrawRequestSchema
);
export default WithdrawRequest;