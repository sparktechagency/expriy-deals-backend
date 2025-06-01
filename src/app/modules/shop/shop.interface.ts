import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';

export interface IShop {
  name: string;
  description: string;
  address: string;
  logo: string;
  banner: string;
  document: string;
  bannerColor: string;
  openingHours: string;
  openingDays: string;
  author: ObjectId | IUser;
  location: {
    type: string;
    coordinates: [number, number];
  };
  isDeleted: boolean;
}

export type IShopModules = Model<IShop, Record<string, unknown>>;
