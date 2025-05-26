import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { addToCardService } from './addToCard.service';
import sendResponse from '../../utils/sendResponse';

const createAddToCard = catchAsync(async (req: Request, res: Response) => {
  req.body.user = req.user.userId;
  const result = await addToCardService.createAddToCard(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'AddToCard created successfully',
    data: result,
  });
});

const getAllAddToCard = catchAsync(async (req: Request, res: Response) => {
  req.query.user = req.user.userId;
  const result = await addToCardService.getAllAddToCard(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All addToCard fetched successfully',
    data: result,
  });
});

const getAddToCardById = catchAsync(async (req: Request, res: Response) => {
  const result = await addToCardService.getAddToCardById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'AddToCard fetched successfully',
    data: result,
  });
});
const updateAddToCard = catchAsync(async (req: Request, res: Response) => {
  const result = await addToCardService.updateAddToCard(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'AddToCard updated successfully',
    data: result,
  });
});

const deleteAddToCard = catchAsync(async (req: Request, res: Response) => {
  const result = await addToCardService.deleteAddToCard(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'AddToCard deleted successfully',
    data: result,
  });
});

export const addToCardController = {
  createAddToCard,
  getAllAddToCard,
  getAddToCardById,
  updateAddToCard,
  deleteAddToCard,
};
