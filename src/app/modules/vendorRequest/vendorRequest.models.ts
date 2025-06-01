import { model, Schema } from 'mongoose';
import {
  IVendorRequest,
  IVendorRequestModules,
} from './vendorRequest.interface';

const vendorRequestSchema = new Schema<IVendorRequest>(
  {
    name: {
      type: String,
      require: true,
    },
    shopName: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    document: {
      type: String,
      require: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'canceled'],
      default: 'pending',
    },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [
        {
          type: Number,
          require: true,
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

const VendorRequest = model<IVendorRequest, IVendorRequestModules>(
  'VendorRequest',
  vendorRequestSchema,
);
export default VendorRequest;
