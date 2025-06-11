import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { paymentsService } from './payments.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

const createPayments = catchAsync(async (req: Request, res: Response) => {
  req.body['user'] = req.user.userId;
  const result = await paymentsService.createPayments(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Payments created successfully',
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.confirmPayment(req?.query);
  // res.redirect(`${config.success_url}?subscriptionId=${result?.subscription}`);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'payment successful',
  });
});

const dashboardData = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.dashboardData(req?.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'dashboard data successful',
  });
});
const vendorDashboardData = catchAsync(async (req: Request, res: Response) => {
  req.query.author = req.user.userId;
  const result = await paymentsService.vendorDashboardData(req?.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'dashboard data successful',
  });
});

const getEarnings = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.getEarnings(req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'earnings data successful',
  });
});
const getVendorEarnings = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.getVendorEarnings(req.user.userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'earnings data successful',
  });
});
const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.getAllPayments(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All payments fetched successfully',
    data: result,
  });
});

const getPaymentsById = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.getPaymentsById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payments fetched successfully',
    data: result,
  });
});

const getPaymentsByOrderId = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.getPaymentsByOrderId(req.params.orderId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Get payment by orderId successfully',
    data: result,
  });
});

const updatePayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.updatePayments(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payments updated successfully',
    data: result,
  });
});

const deletePayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.deletePayments(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payments deleted successfully',
    data: result,
  });
});

export const paymentsController = {
  createPayments,
  getAllPayments,
  getPaymentsById,
  updatePayments,
  deletePayments,
  confirmPayment,
  getEarnings,
  dashboardData,
  getPaymentsByOrderId,
  vendorDashboardData,
  getVendorEarnings,
};
