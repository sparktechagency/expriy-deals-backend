import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';
import { IProducts } from '../products/products.interface';

export interface IAddToCard {
  user: ObjectId | IUser;
  product: ObjectId | IProducts;
  quantity: number;
}

export type IAddToCardModules = Model<IAddToCard, Record<string, unknown>>;
