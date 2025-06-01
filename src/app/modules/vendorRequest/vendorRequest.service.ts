import httpStatus from 'http-status';
import { IVendorRequest } from './vendorRequest.interface';
import VendorRequest from './vendorRequest.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import { notificationServices } from '../notification/notification.service';
import { User } from '../user/user.models';
import { USER_ROLE } from '../user/user.constants';
import { modeType } from '../notification/notification.interface';
import Shop from '../shop/shop.models';
import generateCryptoString from '../../utils/generateCryptoString';
import path from 'path';
import { sendEmail } from '../../utils/mailSender';
import fs from 'fs';
import { startSession } from 'mongoose';
import { deleteFromS3, uploadToS3 } from '../../utils/s3';

const createVendorRequest = async (payload: IVendorRequest, file: any) => {
  const isExist = await User.isUserExist(payload.email);
  console.log('🚀 ~ createVendorRequest ~ isExist:', isExist);
  if (isExist)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'this email already exist using another email',
    );
  const isRequestExist = await VendorRequest.findOne({ email: payload.email });
  if (isRequestExist)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'already using this email request a user, try another email',
    );
  if (file) {
    payload.document = (await uploadToS3({
      file: file,
      fileName: ` images/vendor/documents/${generateCryptoString(3)}`,
    })) as string;
  }
  const result = await VendorRequest.create(payload);
  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to create vendorRequest',
    );
  }
  const admin = await User.findOne({ role: USER_ROLE.admin });
  await notificationServices.insertNotificationIntoDb({
    receiver: admin?._id, // Replace with actual admin user ID or logic to get admin(s)
    message: 'New Vendor Account Request',
    description: `A new vendor account request has been submitted by ${result?.name || 'a user'}. Please review and approve the request.`,
    refference: result?._id, // Replace with actual request ID if applicable
    model_type: modeType.VendorRequest, // Ensure this enum/type exists
  });
  return result;
};

const getAllVendorRequest = async (query: Record<string, any>) => {
  const vendorRequestModel = new QueryBuilder(VendorRequest.find(), query)
    .search(['name', 'email'])
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
  if (!result) {
    throw new Error('VendorRequest not found!');
  }
  return result;
};

const updateVendorRequest = async (
  id: string,
  payload: Partial<IVendorRequest>,
) => {
  const result = await VendorRequest.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to update VendorRequest',
    );
  }
  return result;
};

const approveVendorRequest = async (id: string) => {
  const session = await startSession();
  session.startTransaction();

  try {
    const result = await VendorRequest.findById(id).session(session);
    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Request not found');
    }

    const password = generateCryptoString(10);

    const user = await User.create(
      [
        {
          name: result.name,
          email: result.email,
          role: USER_ROLE.vendor,
          expireAt: null,
          password,
          verification: { status: true },
        },
      ],
      { session },
    );

    const shop = await Shop.create(
      [
        {
          name: result.shopName,
          location: result.location,
          document: result.document,
          author: user[0]._id,
        },
      ],
      { session },
    );

    if (!shop) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Shop creation failed');
    }

    await User.findByIdAndUpdate(
      user[0]._id,
      { shop: shop[0]._id },
      { session },
    );

    const otpEmailPath = path.join(
      __dirname,
      '../../../../public/view/vendor_account_created.html',
    );

    await sendEmail(
      result.email,
      'Your Vendor Request has been approved',
      fs
        .readFileSync(otpEmailPath, 'utf8')
        .replace('{{vendor_name}}', result.name)
        .replace('{{account_email}}', result.email)
        .replace('{{account_password}}', password),
    );
    await VendorRequest.findByIdAndDelete(result._id, { session });

    await session.commitTransaction();
    session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const rejectVendorRequest = async (id: string, payload: { reason: string }) => {
  const result = await VendorRequest.findById(id);
  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to update VendorRequest',
    );
  }

  if (result.document) {
    await deleteFromS3(result?.document);
  }
  const otpEmailPath = path.join(
    __dirname,
    '../../../../public/view/reject_vendor_request.html',
  );

  await sendEmail(
    result?.email,
    'Your Vendor Request has been rejected',
    fs
      .readFileSync(otpEmailPath, 'utf8')
      .replace('{{vendor_name}}', result?.name)
      .replace('{{request}}', payload?.reason),
  );
  await VendorRequest.findByIdAndDelete(id);
  return result;
};
const deleteVendorRequest = async (id: string) => {
  const result = await VendorRequest.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to delete vendorRequest',
    );
  }
  return result;
};

export const vendorRequestService = {
  createVendorRequest,
  getAllVendorRequest,
  getVendorRequestById,
  updateVendorRequest,
  deleteVendorRequest,
  rejectVendorRequest,
  approveVendorRequest,
};
