import httpStatus from 'http-status';
import { IPayments } from './payments.interface';
import Payments from './payments.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import Order from '../order/order.models';
import { startSession, Types } from 'mongoose';
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
import moment from 'moment';
import { USER_ROLE } from '../user/user.constants';
import Products from '../products/products.models';

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
            price: Math.round(order.totalPrice),
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

    await User.findByIdAndUpdate(
      payment?.author,
      { $inc: { balance: payment?.vendorAmount } },
      { session },
    );

    if (!order) {
      throw new AppError(httpStatus.BAD_REQUEST, 'order confirmation failed');
    }
    // const admin = await User.findOne({ role: USER_ROLE.admin });

    // 🔽 Add this block right after the order update
    await Products.findByIdAndUpdate(
      order.product,
      {
        $inc: {
          stock: -order.quantity,
          totalSell: order.quantity,
        },
      },
      { session },
    );

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

const getEarnings = async (query: Record<string, any>) => {
  const { searchTerm } = query;
  const today = moment().startOf('day');

  const searchRegex = searchTerm ? new RegExp(searchTerm.trim(), 'i') : null;

  const earnings = await Payments.aggregate([
    {
      $match: {
        status: PAYMENT_STATUS.paid,
        isDeleted: false,
      },
    },
    {
      $facet: {
        totalEarnings: [
          {
            $group: {
              _id: null,
              total: { $sum: '$price' },
            },
          },
        ],
        todayEarnings: [
          {
            $match: {
              createdAt: {
                $gte: today.toDate(),
                $lte: today.endOf('day').toDate(),
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$price' },
            },
          },
        ],
        allData: [
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'author',
              foreignField: '_id',
              as: 'author',
            },
          },
          {
            $lookup: {
              from: 'orders',
              localField: 'order',
              foreignField: '_id',
              as: 'ordersDetails',
            },
          },
          {
            $unwind: {
              path: '$ordersDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              userObj: { $arrayElemAt: ['$user', 0] },
              authorObj: { $arrayElemAt: ['$author', 0] },
            },
          },
          ...(searchRegex
            ? [
                {
                  $match: {
                    $or: [
                      { 'userObj.name': { $regex: searchRegex } },
                      { trnId: { $regex: searchRegex } },
                      { status: { $regex: searchRegex } },
                    ],
                  },
                },
              ]
            : []),
          {
            $project: {
              user: '$userObj',
              author: '$authorObj',
              order: '$ordersDetails',
              price: 1,
              trnId: 1,
              status: 1,
              id: 1,
              _id: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
          {
            $sort: { createdAt: -1 },
          },
        ],
      },
    },
  ]);

  const totalEarnings = earnings?.[0]?.totalEarnings?.[0]?.total || 0;

  const todayEarnings = earnings?.[0]?.todayEarnings?.[0]?.total || 0;

  const allData = earnings?.[0]?.allData || [];

  return { totalEarnings, todayEarnings, allData };
};

const getVendorEarnings = async (userId: string) => {
  const today = moment().startOf('day');

  const earnings = await Payments.aggregate([
    {
      $match: {
        status: PAYMENT_STATUS.paid,
        author: new Types.ObjectId(userId),
        isDeleted: false,
      },
    },
    {
      $facet: {
        totalEarnings: [
          {
            $group: {
              _id: null,
              total: { $sum: '$price' },
            },
          },
        ],
        todayEarnings: [
          {
            $match: {
              createdAt: {
                $gte: today.toDate(),
                $lte: today.endOf('day').toDate(),
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$price' }, // Sum of today's earnings
            },
          },
        ],
        allData: [
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'author',
              foreignField: '_id',
              as: 'author',
            },
          },
          {
            $lookup: {
              from: 'orders',
              localField: 'orders',
              foreignField: '_id',
              as: 'ordersDetails',
            },
          },
          {
            $unwind: {
              path: '$ordersDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              user: { $arrayElemAt: ['$user', 0] }, // Extract first user if multiple exist
              author: { $arrayElemAt: ['$author', 0] }, // Extract first user if multiple exist
              order: '$ordersDetails', // Already an object, no need for $arrayElemAt
              // package: { $arrayElemAt: ['$packageDetails', 0] }, // Extract first package
              price: 1,
              trnId: 1,
              status: 1,
              id: 1,
              _id: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
        ],
      },
    },
  ]);

  const totalEarnings =
    (earnings?.length > 0 &&
      earnings[0]?.totalEarnings?.length > 0 &&
      earnings[0]?.totalEarnings[0]?.total) ||
    0;
  const todayEarnings =
    (earnings?.length > 0 &&
      earnings[0]?.todayEarnings?.length > 0 &&
      earnings[0]?.todayEarnings[0]?.total) ||
    0;

  const allData = earnings[0]?.allData || [];

  return { totalEarnings, todayEarnings, allData };
};

const dashboardData = async (query: Record<string, any>) => {
  // Income Year Setup
  const year = query.incomeYear ? Number(query.incomeYear) : moment().year();
  const startOfYear = moment().year(year).startOf('year');
  const endOfYear = moment().year(year).endOf('year');

  // Aggregate payments data
  const earnings = await Payments.aggregate([
    {
      $match: {
        status: PAYMENT_STATUS.paid,
        isDeleted: false,
      },
    },
    {
      $facet: {
        totalEarnings: [
          {
            $group: {
              _id: null,
              total: { $sum: '$price' },
            },
          },
        ],
        monthlyIncome: [
          {
            $match: {
              createdAt: {
                $gte: startOfYear.toDate(),
                $lte: endOfYear.toDate(),
              },
            },
          },
          {
            $group: {
              _id: { month: { $month: '$createdAt' } },
              income: { $sum: '$price' },
            },
          },
          { $sort: { '_id.month': 1 } },
        ],
      },
    },
  ]);

  // Extract and format earnings data
  const totalEarnings = earnings?.[0]?.totalEarnings?.[0]?.total || 0;

  const monthlyIncomeRaw = earnings?.[0]?.monthlyIncome || [];

  const formattedMonthlyIncome = Array.from({ length: 12 }, (_, i) => ({
    month: moment().month(i).format('MMM'),
    income: 0,
  }));

  monthlyIncomeRaw.forEach((entry: any) => {
    formattedMonthlyIncome[entry._id.month - 1].income = Math.round(
      entry.income,
    );
  });

  // User Year Setup
  const userYear = query.JoinYear ? Number(query.JoinYear) : moment().year();
  const startOfUserYear = moment().year(userYear).startOf('year');
  const endOfUserYear = moment().year(userYear).endOf('year');

  // Aggregate user data
  const usersData = await User.aggregate([
    {
      $facet: {
        totalRegistration: [
          {
            $match: {
              'verification.status': true,
              isDeleted: false,
              role: { $ne: USER_ROLE.admin },
            },
          },
          { $count: 'count' },
        ],
        totalVendor: [
          {
            $match: {
              role: USER_ROLE.vendor,
              'verification.status': true,
              isDeleted: false,
            },
          },
          { $count: 'count' },
        ],
        totalUsers: [
          {
            $match: {
              role: USER_ROLE.user,
              'verification.status': true,
              isDeleted: false,
            },
          },
          { $count: 'count' },
        ],
        monthlyUser: [
          {
            $match: {
              'verification.status': true,
              role:
                query.role === USER_ROLE.user
                  ? USER_ROLE.user
                  : USER_ROLE.vendor,
              createdAt: {
                $gte: startOfUserYear.toDate(),
                $lte: endOfUserYear.toDate(),
              },
            },
          },
          {
            $group: {
              _id: { month: { $month: '$createdAt' } },
              total: { $sum: 1 },
            },
          },
          { $sort: { '_id.month': 1 } },
        ],
        userDetails: [
          { $match: { role: { $ne: USER_ROLE.admin } } },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              phoneNumber: 1,
              role: 1,
              referenceId: 1,
              createdAt: 1,
              profile: 1,
            },
          },
          { $sort: { createdAt: -1 } },
          { $limit: 15 },
        ],
      },
    },
  ]);

  // Extract user data safely
  const totalUsers = usersData?.[0]?.totalUsers?.[0]?.count || 0;
  const totalProducts = await Products.countDocuments({ isDeleted: false });
  const totalRegistration = usersData?.[0]?.totalRegistration?.[0]?.count || 0;
  const totalVendor = usersData?.[0]?.totalVendor?.[0]?.count || 0;
  const monthlyUserRaw = usersData?.[0]?.monthlyUser || [];
  const userDetails = usersData?.[0]?.userDetails || [];

  // Format monthly user registrations
  const formattedMonthlyUsers = Array.from({ length: 12 }, (_, i) => ({
    month: moment().month(i).format('MMM'),
    total: 0,
  }));

  monthlyUserRaw.forEach((entry: any) => {
    formattedMonthlyUsers[entry._id.month - 1].total = entry.total;
  });

  return {
    totalUsers,
    totalRegistration,
    totalVendor,
    totalIncome: totalEarnings,
    totalProducts,
    monthlyIncome: formattedMonthlyIncome,
    monthlyUsers: formattedMonthlyUsers,
    userDetails,
  };
};

const vendorDashboardData = async (query: Record<string, any>) => {
  // Income Year Setup
  const year = query.incomeYear ? Number(query.incomeYear) : moment().year();
  const startOfYear = moment().year(year).startOf('year');
  const endOfYear = moment().year(year).endOf('year');

  // Aggregate payments data
  const earnings = await Payments.aggregate([
    {
      $match: {
        status: PAYMENT_STATUS.paid,
        author: new Types.ObjectId(query.author),
        isDeleted: false,
      },
    },
    {
      $facet: {
        totalEarnings: [
          {
            $group: {
              _id: null,
              total: { $sum: '$price' },
            },
          },
        ],
        monthlyIncome: [
          {
            $match: {
              createdAt: {
                $gte: startOfYear.toDate(),
                $lte: endOfYear.toDate(),
              },
            },
          },
          {
            $group: {
              _id: { month: { $month: '$createdAt' } },
              income: { $sum: '$price' },
            },
          },
          { $sort: { '_id.month': 1 } },
        ],
      },
    },
  ]);

  // Extract and format earnings data
  const totalEarnings = earnings?.[0]?.totalEarnings?.[0]?.total || 0;

  const monthlyIncomeRaw = earnings?.[0]?.monthlyIncome || [];

  const formattedMonthlyIncome = Array.from({ length: 12 }, (_, i) => ({
    month: moment().month(i).format('MMM'),
    income: 0,
  }));

  monthlyIncomeRaw.forEach((entry: any) => {
    formattedMonthlyIncome[entry._id.month - 1].income = Math.round(
      entry.income,
    );
  });

  const totalProducts = await Products.countDocuments({
    author: query.author,
  });

  return {
    totalIncome: totalEarnings,
    totalProducts,
    monthlyIncome: formattedMonthlyIncome,
  };
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

const getPaymentsByOrderId = async (orderId: string) => {
  const result = await Payments.findOne({ order: orderId }).populate([
    { path: 'user', select: 'name' },
  ]);
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
  getEarnings,
  dashboardData,
  getPaymentsByOrderId,
  vendorDashboardData,
  getVendorEarnings,
};
