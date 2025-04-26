import httpStatus from 'http-status';
import { IOrder } from './order.interface';
import Order from './order.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';

const createOrder = async (payload: IOrder) => {
  const result = await Order.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create order');
  }
  return result;
};

const getAllOrder = async (query: Record<string, any>) => {
  const orderModel = new QueryBuilder(Order.find({ isDeleted: false }), query)
    .search([''])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await orderModel.modelQuery;
  const meta = await orderModel.countTotal();

  return {
    data,
    meta,
  };
};

const getOrderById = async (id: string) => {
  const result = await Order.findById(id);
  if (!result || result?.isDeleted) {
    throw new Error('Order not found!');
  }
  return result;
};

const updateOrder = async (id: string, payload: Partial<IOrder>) => {
  const result = await Order.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Order');
  }
  return result;
};

const deleteOrder = async (id: string) => {
  const result = await Order.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete order');
  }
  return result;
};

export const orderService = {
  createOrder,
  getAllOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
};
