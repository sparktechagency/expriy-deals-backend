import httpStatus from 'http-status';
import { IPayments } from './payments.interface';
import Payments from './payments.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import AuthPaymentService from '../../class/Auth.net/Auth.net';
import Order from '../order/order.models';
import { startSession } from 'mongoose';
import Products from '../products/products.models';
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
  let result;
  const session = await startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(payload?.order).session(session);
    if (!order) throw new AppError(httpStatus.NOT_FOUND, 'Order not found!');

    const data = {
      amount: payload?.price,
      cardNumber: payload?.cardInfo?.cardNumber,
      expiryDate: payload?.cardInfo?.expiryDate,
      cardCode: payload?.cardInfo?.cardCode,
      firstName: payload?.cardInfo?.firstName,
      lastName: payload?.cardInfo?.lastName,
    };

    result = await paymentService.createCharge(data);

    if (result.transactionId === '0' && result.authCode === '000000') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Payment failed. No transaction processed.',
      );
    }

    const paymentRecord = await Payments.create(
      [
        {
          user: order?.user,
          order: order._id,
          author: order?.author,
          status: 'paid',
          deliveryStatus: 'ongoing',
          trnId: result.transactionId,
          price: payload.price,
        },
      ],
      { session },
    );
    await Products.findByIdAndUpdate(
      order?.product,
      {
        $inc: { totalSell: 1, quantity: -1 },
      },
      { session },
    );
    await session.commitTransaction();
    return paymentRecord[0];
  } catch (error: any) {
    await session.abortTransaction();

    // Attempt refund if transaction was successful but saving failed
    if (
      result?.transactionId !== '0' &&
      result?.authCode !== '000000' &&
      payload?.price &&
      payload?.cardInfo
    ) {
      try {
        await paymentService.refund({
          amount: payload.price,
          cardNumber: payload.cardInfo.cardNumber.slice(-4),

          transactionId: result?.transactionId as string,
        });
      } catch (refundError: any) {
        console.error('Refund failed:', refundError.message);
      }
    }

    throw error;
  } finally {
    session.endSession();
  }
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
