import { model, Schema } from 'mongoose';
import { IBankDetails, IBankDetailsModules } from './bankDetails.interface';

const bankDetailsSchema = new Schema<IBankDetails>(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
    },
    routingNumber: {
      type: String,
      required: [true, 'Routing number is required'],
    },
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
    },
    bankHolderName: {
      type: String,
      required: [true, 'Account holder name is required'],
    },
    bankAddress: {
      type: String,
      required: [true, 'Bank address is required'],
    },
  },
  {
    timestamps: true,
  },
);

bankDetailsSchema.statics.findByVendorId = async function (userId: string) {
  return await BankDetails.findOne({ vendor: userId });
};
const BankDetails = model<IBankDetails, IBankDetailsModules>(
  'BankDetails',
  bankDetailsSchema,
);
export default BankDetails;
