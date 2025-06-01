import { Model, ObjectId, Types } from 'mongoose';
import { IShop } from '../shop/shop.interface';

export interface IUser {
  _id?: Types.ObjectId;
  shop: ObjectId | IShop;
  status: string;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  gender: 'Male' | 'Female' | 'Others';
  dateOfBirth: string;
  stripeAccountId: string;
  profile: string;
  document: string;
  role: string;
  balance: number;
  loginWth: 'google' | 'apple' | 'facebook' | 'credentials';
  expireAt: Date;
  address?: string;
  city?: string;
  state?: string;
  stripeccountId: string;
  country?: string;
  zipCode?: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  isDeleted: boolean;
  verification: {
    otp: string | number;
    expiresAt: Date;
    status: boolean;
  };
}

export interface UserModel extends Model<IUser> {
  isUserExist(email: string): Promise<IUser>;
  IsUserExistId(id: string): Promise<IUser>;
  IsUserExistUserName(userName: string): Promise<IUser>;

  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}
