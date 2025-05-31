
import { model, Schema } from 'mongoose';
import { IVendorRequest, IVendorRequestModules } from './vendorRequest.interface';

const vendorRequestSchema = new Schema<IVendorRequest>(
  {
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  }
);

//vendorRequestSchema.pre('find', function (next) {
//  //@ts-ignore
//  this.find({ isDeleted: { $ne: true } });
//  next();
//});

//vendorRequestSchema.pre('findOne', function (next) {
  //@ts-ignore
  //this.find({ isDeleted: { $ne: true } });
 // next();
//});

vendorRequestSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

const VendorRequest = model<IVendorRequest, IVendorRequestModules>(
  'VendorRequest',
  vendorRequestSchema
);
export default VendorRequest;