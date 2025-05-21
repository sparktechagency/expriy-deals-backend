import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { orderService } from './order.service';
import sendResponse from '../../utils/sendResponse';

const createOrder = catchAsync(async (req: Request, res: Response) => {
  req.body.user = req.user?.userId;
  const result = await orderService.createOrder(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Order created successfully',
    data: result,
  });
});

const getAllOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await orderService.getAllOrder(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All order fetched successfully',
    data: result,
  });
});
const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  req.query.user = req.user.userId;
  const result = await orderService.getAllOrder(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My order fetched successfully',
    data: result,
  });
});
const getMyShopOrders = catchAsync(async (req: Request, res: Response) => {
  req.query['author'] = req.user.userId;
  const result = await orderService.getAllOrder(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My order fetched successfully',
    data: result,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const result = await orderService.getOrderById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order fetched successfully',
    data: result,
  });
});

const updateOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await orderService.updateOrder(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order updated successfully',
    data: result,
  });
});

const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await orderService.deleteOrder(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order deleted successfully',
    data: result,
  });
});

export const orderController = {
  createOrder,
  getAllOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
  getMyOrders,
  getMyShopOrders,
};
