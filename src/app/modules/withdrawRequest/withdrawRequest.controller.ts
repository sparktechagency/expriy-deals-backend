import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { withdrawRequestService } from './withdrawRequest.service';
import sendResponse from '../../utils/sendResponse';

const createWithdrawRequest = catchAsync(
  async (req: Request, res: Response) => {
    req.body.vendor = req.user.userId;
    const result = await withdrawRequestService.createWithdrawRequest(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'WithdrawRequest created successfully',
      data: result,
    });
  },
);

const getAllWithdrawRequest = catchAsync(
  async (req: Request, res: Response) => {
    const result = await withdrawRequestService.getAllWithdrawRequest(
      req.query,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'All withdrawRequest fetched successfully',
      data: result,
    });
  },
);
const getMyWithdrawRequest = catchAsync(async (req: Request, res: Response) => {
  req.query['vendor'] = req.user.userId;
  console.log(req.body);
  const result = await withdrawRequestService.getAllWithdrawRequest(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All withdrawRequest fetched successfully',
    data: result,
  });
});

const getWithdrawRequestById = catchAsync(
  async (req: Request, res: Response) => {
    const result = await withdrawRequestService.getWithdrawRequestById(
      req.params.id,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'WithdrawRequest fetched successfully',
      data: result,
    });
  },
);

const updateWithdrawRequest = catchAsync(
  async (req: Request, res: Response) => {
    const result = await withdrawRequestService.updateWithdrawRequest(
      req.params.id,
      req.body,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'WithdrawRequest updated successfully',
      data: result,
    });
  },
);

const approvedWithdrawRequest = catchAsync(
  async (req: Request, res: Response) => {
    const result = await withdrawRequestService.approvedWithdrawRequest(
      req.params.id,
      req.body,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Approved withdraw request successfully',
      data: result,
    });
  },
);

const rejectWithdrawRequest = catchAsync(
  async (req: Request, res: Response) => {
    const result = await withdrawRequestService.rejectWithdrawRequest(
      req.params.id,
      req.body,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Reject withdraw request successfully',
      data: result,
    });
  },
);

const deleteWithdrawRequest = catchAsync(
  async (req: Request, res: Response) => {
    const result = await withdrawRequestService.deleteWithdrawRequest(
      req.params.id,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'WithdrawRequest deleted successfully',
      data: result,
    });
  },
);

export const withdrawRequestController = {
  createWithdrawRequest,
  getAllWithdrawRequest,
  getWithdrawRequestById,
  updateWithdrawRequest,
  deleteWithdrawRequest,
  // myWithdrawRequest,
  rejectWithdrawRequest,
  approvedWithdrawRequest,
  getMyWithdrawRequest,
};
