import httpStatus from 'http-status';
import { IWithdrawRequest } from './withdrawRequest.interface';
import WithdrawRequest from './withdrawRequest.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import BankDetails from '../bankDetails/bankDetails.models';
import { IBankDetails } from '../bankDetails/bankDetails.interface';
import { ObjectId } from 'mongoose';
import { User } from '../user/user.models';
import { IUser } from '../user/user.interface';

const createWithdrawRequest = async (payload: IWithdrawRequest) => {
  const bankDetails: IBankDetails | null = await BankDetails.findByVendorId(
    payload?.vendor?.toString(),
  );

  if (!bankDetails) {
    throw new AppError(
      httpStatus?.BAD_REQUEST,
      "You don't have Bank detail. first add bank details then try again",
    );
  }
  const user: IUser | null = await User.findById(payload?.vendor);
  if (!user) throw new AppError(httpStatus.BAD_REQUEST, 'vendor not found');

  if (Number(payload?.amount) > Number(user?.balance)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient balance');
  }

  payload.bankDetails = bankDetails?._id as ObjectId;

  const result = await WithdrawRequest.create(payload);
  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to create withdrawRequest',
    );
  }
  return result;
};

const getAllWithdrawRequest = async (query: Record<string, any>) => {
  const withdrawRequestModel = new QueryBuilder(
    WithdrawRequest.find().populate({
      path: 'user',
      select: 'name email phoneNumber profile',
    }),
    query,
  )
    .search([''])
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

const myWithdrawRequest = async (id: string) => {
  const result = await WithdrawRequest.findOne({ vendor: id }).populate({
    path: 'user',
    select: 'name email phoneNumber profile',
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'WithdrawRequest not found!');
  }
  return result;
};
const getWithdrawRequestById = async (id: string) => {
  const result = await WithdrawRequest.findById(id).populate({
    path: 'user',
    select: 'name email phoneNumber profile',
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'WithdrawRequest not found!');
  }
  return result;
};

const updateWithdrawRequest = async (
  id: string,
  payload: Partial<IWithdrawRequest>,
) => {
  const result = await WithdrawRequest.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to update WithdrawRequest',
    );
  }
  return result;
};

const deleteWithdrawRequest = async (id: string) => {
  const result = await WithdrawRequest.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to delete withdrawRequest',
    );
  }
  return result;
};

export const withdrawRequestService = {
  createWithdrawRequest,
  getAllWithdrawRequest,
  getWithdrawRequestById,
  updateWithdrawRequest,
  deleteWithdrawRequest,
  myWithdrawRequest,
};
