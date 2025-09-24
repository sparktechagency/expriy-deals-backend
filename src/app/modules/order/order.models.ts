import { model, Schema } from 'mongoose';
import { IOrder, IOrderModules } from './order.interface';
import generateCryptoString from '../../utils/generateCryptoString';

const orderSchema = new Schema<IOrder>(
  {
    id: {
      type: String,
      default: () => generateCryptoString(6),
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'author is required'],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Products',
      required: [true, 'Product is required'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: 1,
    },
    discount: {
      type: Number,
      required: [true, 'discount is required'],
      min: 0,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 1,
    },
    tnxId: {
      type: String,
      unique: true,
      default: () => generateCryptoString(10),
    },
    status: {
      type: String,
      enum: ['pending', 'ongoing', 'cancelled', 'delivered'],
      default: 'pending',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    billingDetails: {
      address: {
        type: String,
        required: [true, 'Address is required'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
      },
      state: {
        type: String,
        required: [true, 'State is required'],
      },
      zipCode: {
        type: String,
        required: [true, 'Zip code is required'],
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
      },
    },
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  },
);

 

const Order = model<IOrder, IOrderModules>('Order', orderSchema);
export default Order;
