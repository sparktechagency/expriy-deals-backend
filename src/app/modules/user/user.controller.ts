import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { userService } from './user.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { uploadToS3 } from '../../utils/s3';
import { otpServices } from '../otp/otp.service';
import { User } from './user.models';
import { UploadedFiles } from '../../interface/common.interface';

const createUser = catchAsync(async (req: Request, res: Response) => {
  if (req.files) {
    const { profile, document } = req.files as UploadedFiles;

    if (profile) {
      req.body.profile = await uploadToS3({
        file: profile[0],
        fileName: `images/user/profile/${Math.floor(100000 + Math.random() * 900000)}`,
      });
    }

    if (document) {
      req.body.document = await uploadToS3({
        file: document[0],
        fileName: `images/user/documents/${Math.floor(100000 + Math.random() * 900000)}`,
      });
    }
  }
  const result = await userService.createUser(req.body); 
  const sendOtp = await otpServices.resendOtp(result?.email);
   
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User created successfully',
    data: { user: result, otpToken: sendOtp },
  });
});

const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getAllUser(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users fetched successfully',
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.geUserById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User fetched successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  console.log(req);
  const result = await userService.geUserById(req?.user?.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'profile fetched successfully',
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  await User.findById(req.params.id);

  if (req.files) {
    const { profile, document } = req.files as UploadedFiles;

    if (profile) {
      req.body.profile = await uploadToS3({
        file: profile[0],
        fileName: `images/user/profile/${Math.floor(100000 + Math.random() * 900000)}`,
      });
    }

    if (document) {
      req.body.document = await uploadToS3({
        file: document[0],
        fileName: `images/user/documents/${Math.floor(100000 + Math.random() * 900000)}`,
      });
    }
  }
  const result = await userService.updateUser(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  if (req.files) {
    const { profile, document } = req.files as UploadedFiles;

    if (profile) {
      req.body.profile = await uploadToS3({
        file: profile[0],
        fileName: `images/user/profile/${Math.floor(100000 + Math.random() * 900000)}`,
      });
    }

    if (document) {
      req.body.document = await uploadToS3({
        file: document[0],
        fileName: `images/user/documents/${Math.floor(100000 + Math.random() * 900000)}`,
      });
    }
  }
  const result = await userService.updateUser(req?.user?.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'profile updated successfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.deleteUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

const deleteMYAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.deleteUser(req.user?.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

export const userController = {
  createUser,
  getAllUser,
  getUserById,
  getMyProfile,
  updateUser,
  updateMyProfile,
  deleteUser,
  deleteMYAccount,
};
