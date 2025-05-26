import { model, Schema } from 'mongoose';
import { IAddToCard, IAddToCardModules } from './addToCard.interface';

const addToCardSchema = new Schema<IAddToCard>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Products',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

const AddToCard = model<IAddToCard, IAddToCardModules>(
  'AddToCard',
  addToCardSchema,
);
export default AddToCard;
