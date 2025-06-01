import httpStatus from 'http-status';
import { IPayments } from './payments.interface';
import Payments from './payments.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import Order from '../order/order.models';
import { startSession } from 'mongoose';
import generateCryptoString from '../../utils/generateCryptoString';
import StripePaymentService from '../../class/stripe/stripe';
import config from '../../config';
import { User } from '../user/user.models';
import { IProducts } from '../products/products.interface';
import { PAYMENT_STATUS } from './payments.constants';
import { ORDER_STATUS } from '../order/order.constants';
import { notificationServices } from '../notification/notification.service';
import { IUser } from '../user/user.interface';
import { modeType } from '../notification/notification.interface';

const createPayments = async (payload: IPayments) => {
  const session = await startSession();
  session.startTransaction();
  try {
    // Find order with product populated, in transaction session
    const order = await Order.findById(payload.order)
      .populate({ path: 'product', select: '_id name images' })
      .session(session);
    if (!order) throw new AppError(httpStatus.NOT_FOUND, 'Order not found');

    // Check for existing pending payment for this order
    let payment;
    const isPaymentExists = await Payments.findOne({
      order: order._id,
      isDeleted: false,
      status: 'pending',
    }).session(session);

    const trnId = generateCryptoString(10);

    if (isPaymentExists) {
      const newPayment = await Payments.findByIdAndUpdate(
        isPaymentExists?._id,
        { trnId },
        { new: true, upsert: false, session },
      );
      if (!newPayment) {
        throw new AppError(httpStatus.BAD_REQUEST, 'payment failed ');
      }
      payment = newPayment;
    } else {
      // Create new payment document
      payment = await Payments.create(
        [
          {
            user: order.user,
            author: order.author,
            order: order._id,
            trnId,
            price: order.totalPrice,
          },
        ],
        { session },
      ).then(docs => docs[0]);
    }

    if (!payment)
      throw new AppError(httpStatus.BAD_REQUEST, 'Payment creation failed');

    // Retrieve user info for Stripe customer id

    const user = await User.findById(payment.user).session(session);

    if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

    let customerId = user.customer;
    if (!customerId) {
      // Create Stripe customer if not exist
      const newCustomer = await StripePaymentService.createCustomer(
        user.email!,
        user.name!,
      );
      customerId = newCustomer.id;
      // Optionally save customerId back to user document (if you want)
      user.customer = customerId;
      await User.findByIdAndUpdate(
        user?._id,
        { customer: customerId },
        { new: true, upsert: false, session },
      );
    }

    // Prepare product info for checkout
    const product = {
      amount: Math.round(payment.price),
      name: (order.product as IProducts)?.name || 'A Product',

      quantity: 1,
    };

    const successUrl = `${config.server_url}/payments/confirm-payment?sessionId={CHECKOUT_SESSION_ID}&paymentId=${payment._id}`;
    const cancelUrl = `${config.server_url}/payments/cancel?paymentId=${payment._id}`;
    const currency = config.stripe.currency || 'usd';

    // Create Stripe checkout session
    const checkoutSession = await StripePaymentService.getCheckoutSession(
      product,
      successUrl,
      cancelUrl,
      currency,
      customerId,
    );

    await session.commitTransaction();

    return checkoutSession?.url || null;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const confirmPayment = async (query: Record<string, any>) => {
  const { sessionId, paymentId } = query;
  const session = await startSession();
  const PaymentSession =
    await StripePaymentService.getPaymentSession(sessionId);
  const paymentIntentId = PaymentSession.payment_intent as string;

  if (!(await StripePaymentService.isPaymentSuccess(sessionId))) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Payment session is not completed',
    );
  }

  try {
    session.startTransaction();
    const payment = await Payments.findByIdAndUpdate(
      paymentId,
      { status: PAYMENT_STATUS?.paid, paymentIntentId: paymentIntentId },
      { new: true, session },
    ).populate([
      { path: 'user', select: 'name _id email phoneNumber profile ' },
      { path: 'author', select: 'name _id email phoneNumber profile' },
    ]);

    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, 'Payment Not Found!');
    }
    const order = await Order.findByIdAndUpdate(
      payment?.order,
      {
        status: ORDER_STATUS?.ongoing,
        tnxId: payment?.trnId,
        isPaid: true,
      },
      { new: true, session },
    );
    if (!order) {
      throw new AppError(httpStatus.BAD_REQUEST, 'order confirmation failed');
    }
    // const admin = await User.findOne({ role: USER_ROLE.admin });

    notificationServices.insertNotificationIntoDb({
      receiver: (payment?.user as IUser)?._id,
      message: 'Payment Successful',
      description: `Your payment for the Order #"${order && order.id}" was successful.`,
      refference: payment?._id,
      model_type: modeType.Payments,
    });

    // For Restaurant (Seller)
    notificationServices.insertNotificationIntoDb({
      receiver: (payment?.author as IUser)?._id,
      message: 'New Payment Received',
      description: `You have received a payment for the Order #"${order && order.id}".`,
      refference: payment?._id,
      model_type: modeType.Payments,
    });

    await session.commitTransaction();
    return payment;
  } catch (error: any) {
    await session.abortTransaction();

    if (sessionId) {
      try {
        await StripePaymentService.retrieve(sessionId);
      } catch (refundError: any) {
        console.error('Error processing refund:', refundError.message);
      }
    }

    throw new AppError(httpStatus.BAD_GATEWAY, error.message);
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
  confirmPayment,
};
