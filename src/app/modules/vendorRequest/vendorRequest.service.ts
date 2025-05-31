
import httpStatus from 'http-status';
import { IVendorRequest } from './vendorRequest.interface';
import VendorRequest from './vendorRequest.models';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';

const createVendorRequest = async (payload: IVendorRequest) => {
  const result = await VendorRequest.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create vendorRequest');
  }
  return result;
};

const getAllVendorRequest = async (query: Record<string, any>) => {
query["isDeleted"] = false;
  const vendorRequestModel = new QueryBuilder(VendorRequest.find(), query)
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await vendorRequestModel.modelQuery;
  const meta = await vendorRequestModel.countTotal();

  return {
    data,
    meta,
  };
};

const getVendorRequestById = async (id: string) => {
  const result = await VendorRequest.findById(id);
  if (!result && result?.isDeleted) {
    throw new Error('VendorRequest not found!');
  }
  return result;
};

const updateVendorRequest = async (id: string, payload: Partial<IVendorRequest>) => {
  const result = await VendorRequest.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update VendorRequest');
  }
  return result;
};

const deleteVendorRequest = async (id: string) => {
  const result = await VendorRequest.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete vendorRequest');
  }
  return result;
};

export const vendorRequestService = {
  createVendorRequest,
  getAllVendorRequest,
  getVendorRequestById,
  updateVendorRequest,
  deleteVendorRequest,
};