import { Model, ObjectId } from 'mongoose';
import { ICategory } from '../category/category.interface';
interface IImages {
  key: string;
  url: string;
}
export interface IProducts {
  images: IImages[];
  author: ObjectId;
  name: string;
  details: string;
  category: ObjectId | ICategory;
  price: number;
  totalSell: number;
  stock: number;
  expiredAt: string;
  discount: number;
  discountPerDayIncise: number;
  isDeleted: boolean;
}

export type IProductsModules = Model<IProducts, Record<string, unknown>>;
