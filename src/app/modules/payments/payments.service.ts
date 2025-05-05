import httpStatus from 'http-status';
import { IPayments } from './payments.interface';
import Payments from './payments.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import AuthPaymentService from '../../class/Auth.net/Auth.net';
const paymentService = new AuthPaymentService();
interface PaymentRequest {
  amount: number;
  cardNumber: string;
  expiryDate: string;
  cardCode: string;
  firstName: string;
  lastName: string;
}

const createPayments = async (payload: IPayments) => {
  const data: PaymentRequest = {
    amount: 200,
    cardNumber: '123',
    cardCode: '4111111111111111',
    expiryDate: '1225',
    firstName: 'John',
    lastName: 'Doe',
  };
  const result = await paymentService.createCharge(data);
  // const result = await Payments.create(payload);
  // if (!result) {
  //   throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create payments');
  // }
  console.log(result);
  return result;
};

const getAllPayments = async (query: Record<string, any>) => {
  const paymentsModel = new QueryBuilder(
    Payments.find({ isDeleted: false }),
    query,
  )
    .search([''])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await paymentsModel.modelQuery;
  const meta = await paymentsModel.countTotal();

  return {
    data,
    meta,
  };
};

const getPaymentsById = async (id: string) => {
  const result = await Payments.findById(id);
  if (!result || result?.isDeleted) {
    throw new Error('Payments not found!');
  }
  return result;
};

const updatePayments = async (id: string, payload: Partial<IPayments>) => {
  const result = await Payments.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Payments');
  }
  return result;
};

const deletePayments = async (id: string) => {
  const result = await Payments.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete payments');
  }
  return result;
};

export const paymentsService = {
  createPayments,
  getAllPayments,
  getPaymentsById,
  updatePayments,
  deletePayments,
};
