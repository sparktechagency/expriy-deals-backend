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
import { notificationServices } from '../notification/notification.service';
import { USER_ROLE } from '../user/user.constants';
import { modeType } from '../notification/notification.interface';

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
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'vendor not found');

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
  const admin = await User.findOne({ role: USER_ROLE.admin });
  await notificationServices.insertNotificationIntoDb({
    receiver: admin?._id,
    message: 'New Withdrawal Request Submitted',
    description: `A new withdrawal request has been submitted by ${user?.name ?? 'a user'} for the amount of $${result?.amount ?? 'N/A'}.`,
    refference: result?._id,
    model_type: modeType.WithdrawRequest,
  });
  return result;
};

const getAllWithdrawRequest = async (query: Record<string, any>) => {
  const withdrawRequestModel = new QueryBuilder(
    WithdrawRequest.find().populate([
      {
        path: 'vendor',
        select: 'name email phoneNumber profile',
      },
      {
        path: 'bankDetails',
      },
    ]),
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

const getWithdrawRequestById = async (id: string) => {
  const result = await WithdrawRequest.findById(id).populate({
    path: 'vendor',
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
const approvedWithdrawRequest = async (
  id: string,
  payload: { refNumber: string },
) => {
  const result = await WithdrawRequest.findByIdAndUpdate(
    id,
    { status: 'approved', refNumber: payload?.refNumber },
    {
      new: true,
    },
  );
  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to update WithdrawRequest',
    );
  }
  await notificationServices.insertNotificationIntoDb({
    receiver: result?.vendor,
    message: 'Withdrawal Request Approved',
    description: `Your withdrawal request of $${result?.amount || 'N/A'} has been approved Ref.Number:${payload?.refNumber} and is being processed.`,
    refference: result?._id,
    model_type: modeType.WithdrawRequest,
  });

  return result;
};
const rejectWithdrawRequest = async (
  id: string,
  payload: Partial<IWithdrawRequest>,
) => {
  const result = await WithdrawRequest.findByIdAndUpdate(
    id,
    { status: 'rejected', reason: payload?.reason },
    {
      new: true,
    },
  );

  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to update WithdrawRequest',
    );
  }

  await notificationServices.insertNotificationIntoDb({
    receiver: result?.vendor,
    message: 'Withdrawal Request Rejected',
    description: `Your withdrawal request of $${result?.amount || 'N/A'} has been rejected by the admin.`,
    refference: result?._id,
    model_type: modeType.WithdrawRequest,
  });

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
  // myWithdrawRequest,
  rejectWithdrawRequest,
  approvedWithdrawRequest,
};
