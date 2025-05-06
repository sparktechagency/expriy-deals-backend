import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { bankDetailsService } from './bankDetails.service';
import sendResponse from '../../utils/sendResponse';

const createBankDetails = catchAsync(async (req: Request, res: Response) => {
  req.body.vendor = req.user.userId;
  const result = await bankDetailsService.createBankDetails(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'BankDetails created successfully',
    data: result,
  });
});

const getAllBankDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await bankDetailsService.getAllBankDetails(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All bankDetails fetched successfully',
    data: result,
  });
});

const getBankDetailsById = catchAsync(async (req: Request, res: Response) => {
  const result = await bankDetailsService.getBankDetailsById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'BankDetails fetched successfully',
    data: result,
  });
});

const getBankDetailsByVendorId = catchAsync(
  async (req: Request, res: Response) => {
    const result = await bankDetailsService.getBankDetailsByVendorId(
      req.user.userId,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'my fetched successfully',
      data: result,
    });
  },
);

const updateBankDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await bankDetailsService.updateBankDetails(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'BankDetails updated successfully',
    data: result,
  });
});

const deleteBankDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await bankDetailsService.deleteBankDetails(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'BankDetails deleted successfully',
    data: result,
  });
});

export const bankDetailsController = {
  createBankDetails,
  getAllBankDetails,
  getBankDetailsById,
  updateBankDetails,
  getBankDetailsByVendorId,
  deleteBankDetails,
};
