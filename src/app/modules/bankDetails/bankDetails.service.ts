import httpStatus from 'http-status';
import { IBankDetails } from './bankDetails.interface';
import BankDetails from './bankDetails.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';

const createBankDetails = async (payload: IBankDetails) => {
  const result = await BankDetails.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create bankDetails');
  }
  return result;
};

const getAllBankDetails = async (query: Record<string, any>) => {
  const bankDetailsModel = new QueryBuilder(BankDetails.find(), query)
    .search([''])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await bankDetailsModel.modelQuery;
  const meta = await bankDetailsModel.countTotal();

  return {
    data,
    meta,
  };
};

const getBankDetailsById = async (id: string) => {
  const result = await BankDetails.findById(id);
  if (!result) {
    throw new Error('BankDetails not found!');
  }
  return result;
};
const getBankDetailsByVendorId = async (id: string) => {
  const result = await BankDetails.findByVendorId(id);
  if (!result) {
    throw new Error('BankDetails not found!');
  }
  return result;
};

const updateBankDetails = async (
  id: string,
  payload: Partial<IBankDetails>,
) => {
  const result = await BankDetails.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new Error('Failed to update BankDetails');
  }
  return result;
};

const deleteBankDetails = async (id: string) => {
  const result = await BankDetails.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete bankDetails');
  }
  return result;
};

export const bankDetailsService = {
  createBankDetails,
  getAllBankDetails,
  getBankDetailsById,
  updateBankDetails,
  deleteBankDetails,
  getBankDetailsByVendorId,
};
