
import httpStatus from 'http-status';
import { IWithdrawRequest } from './withdrawRequest.interface';
import WithdrawRequest from './withdrawRequest.models';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';

const createWithdrawRequest = async (payload: IWithdrawRequest) => {
  const result = await WithdrawRequest.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create withdrawRequest');
  }
  return result;
};

const getAllWithdrawRequest = async (query: Record<string, any>) => {
query["isDeleted"] = false;
  const withdrawRequestModel = new QueryBuilder(WithdrawRequest.find(), query)
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await withdrawRequestModel.modelQuery;
  const meta = await withdrawRequestModel.countTotal();

  return {
    data,
    meta,
  };
};

const getWithdrawRequestById = async (id: string) => {
  const result = await WithdrawRequest.findById(id);
  if (!result && result?.isDeleted) {
    throw new Error('WithdrawRequest not found!');
  }
  return result;
};

const updateWithdrawRequest = async (id: string, payload: Partial<IWithdrawRequest>) => {
  const result = await WithdrawRequest.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update WithdrawRequest');
  }
  return result;
};

const deleteWithdrawRequest = async (id: string) => {
  const result = await WithdrawRequest.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete withdrawRequest');
  }
  return result;
};

export const withdrawRequestService = {
  createWithdrawRequest,
  getAllWithdrawRequest,
  getWithdrawRequestById,
  updateWithdrawRequest,
  deleteWithdrawRequest,
};