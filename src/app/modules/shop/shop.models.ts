import { model, Schema, Types } from 'mongoose';
import { IShop, IShopModules } from './shop.interface';
import generateRandomHexColor from '../../utils/generateRandomHexColor';

const shopSchema = new Schema<IShop>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    openingHours: {
      type: String,
      default: null,
    },
    openingDays: {
      type: String,
      default: null,
    },
    logo: {
      type: String,
      default: null,
    },
    banner: {
      type: String,
      default: null,
    },
    document: {
      type: String,
      default: null,
    },
    bannerColor: {
      type: String,
      default: () => generateRandomHexColor(),
    },
    author: {
      type: Types.ObjectId,
      default: null,
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },

      coordinates: [{ type: Number, required: true }],
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

const Shop = model<IShop, IShopModules>('Shop', shopSchema);
export default Shop;
