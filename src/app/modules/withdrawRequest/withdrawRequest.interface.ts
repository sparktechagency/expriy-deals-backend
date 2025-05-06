
import { Model } from 'mongoose';

export interface IWithdrawRequest {}

export type IWithdrawRequestModules = Model<IWithdrawRequest, Record<string, unknown>>;