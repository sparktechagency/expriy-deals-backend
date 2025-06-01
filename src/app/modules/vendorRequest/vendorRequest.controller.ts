import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { vendorRequestService } from './vendorRequest.service';
import sendResponse from '../../utils/sendResponse';

const createVendorRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await vendorRequestService.createVendorRequest(
    req.body,
    req.file,
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'VendorRequest created successfully',
    data: result,
  });
});

const getAllVendorRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await vendorRequestService.getAllVendorRequest(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All vendorRequest fetched successfully',
    data: result,
  });
});

const getVendorRequestById = catchAsync(async (req: Request, res: Response) => {
  const result = await vendorRequestService.getVendorRequestById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'VendorRequest fetched successfully',
    data: result,
  });
});

const updateVendorRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await vendorRequestService.updateVendorRequest(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'VendorRequest updated successfully',
    data: result,
  });
});
const approveVendorRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await vendorRequestService.approveVendorRequest(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'VendorRequest approved successfully',
    data: result,
  });
});
const rejectVendorRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await vendorRequestService.rejectVendorRequest(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'VendorRequest rejected successfully',
    data: result,
  });
});

const deleteVendorRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await vendorRequestService.deleteVendorRequest(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'VendorRequest deleted successfully',
    data: result,
  });
});

export const vendorRequestController = {
  createVendorRequest,
  getAllVendorRequest,
  getVendorRequestById,
  updateVendorRequest,
  deleteVendorRequest,
  rejectVendorRequest,
  approveVendorRequest,
};
