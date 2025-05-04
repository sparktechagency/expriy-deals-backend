import { model, Schema } from 'mongoose';
import { IPayments, IPaymentsModules } from './payments.interface';

const paymentsSchema = new Schema<IPayments>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Orders',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'ongoing', 'picUp', 'shifted', 'delivered'],
      default: 'pending',
    },
    trnId: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },

    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

//paymentsSchema.pre('find', function (next) {
//  //@ts-ignore
//  this.find({ isDeleted: { $ne: true } });
//  next();
//});

//paymentsSchema.pre('findOne', function (next) {
//@ts-ignore
//this.find({ isDeleted: { $ne: true } });
// next();
//});

paymentsSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

const Payments = model<IPayments, IPaymentsModules>('Payments', paymentsSchema);
export default Payments;
