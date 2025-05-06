
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';  
import { withdrawRequestService } from './withdrawRequest.service';
import sendResponse from '../../utils/sendResponse';
import { storeFile } from '../../utils/fileHelper';
import { uploadToS3 } from '../../utils/s3';

const createWithdrawRequest = catchAsync(async (req: Request, res: Response) => {
 const result = await withdrawRequestService.createWithdrawRequest(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'WithdrawRequest created successfully',
    data: result,
  });

});

const getAllWithdrawRequest = catchAsync(async (req: Request, res: Response) => {

 const result = await withdrawRequestService.getAllWithdrawRequest(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All withdrawRequest fetched successfully',
    data: result,
  });

});

const getWithdrawRequestById = catchAsync(async (req: Request, res: Response) => {
 const result = await withdrawRequestService.getWithdrawRequestById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'WithdrawRequest fetched successfully',
    data: result,
  });

});
const updateWithdrawRequest = catchAsync(async (req: Request, res: Response) => {
const result = await withdrawRequestService.updateWithdrawRequest(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'WithdrawRequest updated successfully',
    data: result,
  });

});


const deleteWithdrawRequest = catchAsync(async (req: Request, res: Response) => {
 const result = await withdrawRequestService.deleteWithdrawRequest(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'WithdrawRequest deleted successfully',
    data: result,
  });

});

export const withdrawRequestController = {
  createWithdrawRequest,
  getAllWithdrawRequest,
  getWithdrawRequestById,
  updateWithdrawRequest,
  deleteWithdrawRequest,
};