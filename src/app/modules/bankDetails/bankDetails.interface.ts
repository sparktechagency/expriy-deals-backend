import { Model, ObjectId } from 'mongoose';

export interface IBankDetails {
  _id: ObjectId | string;
  vendor: ObjectId;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  bankHolderName: string;
  bankAddress: string;
}

export interface IBankDetailsModules
  extends Model<IBankDetails, Record<string, unknown>> {
  findByVendorId(vendorId: string): Promise<IBankDetails>;
}
