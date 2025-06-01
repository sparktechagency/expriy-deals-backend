import { Model } from 'mongoose';

export interface IVendorRequest {
  name: string;
  shopName: string;
  email: string;
  document: string;
  status: 'pending' | 'approved' | 'canceled';
  location: {
    type: 'Point';
    coordinates: [Number];
  };
}

export type IVendorRequestModules = Model<
  IVendorRequest,
  Record<string, unknown>
>;
