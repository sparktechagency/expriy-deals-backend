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
    adminAmount: {
      type: Number,
    },
    vendorAmount: {
      type: Number,
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
    paymentIntentId: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

paymentsSchema.pre('save', function (next) {
  if (
    this.isModified('price') ||
    this.adminAmount == null ||
    this.vendorAmount == null
  ) {
    this.adminAmount = Number(this.price) * 0.1;
    this.vendorAmount = Number(this.price) * 0.9;
  }
  next();
});
const Payments = model<IPayments, IPaymentsModules>('Payments', paymentsSchema);
export default Payments;
