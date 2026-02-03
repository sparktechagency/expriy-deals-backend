"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentsService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const payments_models_1 = __importDefault(require("./payments.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const order_models_1 = __importDefault(require("../order/order.models"));
const mongoose_1 = require("mongoose");
const generateCryptoString_1 = __importDefault(require("../../utils/generateCryptoString"));
const stripe_1 = __importDefault(require("../../class/stripe/stripe"));
const config_1 = __importDefault(require("../../config"));
const user_models_1 = require("../user/user.models");
const payments_constants_1 = require("./payments.constants");
const order_constants_1 = require("../order/order.constants");
const notification_service_1 = require("../notification/notification.service");
const notification_interface_1 = require("../notification/notification.interface");
const moment_1 = __importDefault(require("moment"));
const user_constants_1 = require("../user/user.constants");
const products_models_1 = __importDefault(require("../products/products.models"));
const createPayments = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, mongoose_1.startSession)();
    session.startTransaction();
    try {
        // Find order with product populated, in transaction session
        const order = yield order_models_1.default.findById(payload.order).session(session);
        if (!order)
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Order not found');
        // Check for existing pending payment for this order
        let payment;
        const isPaymentExists = yield payments_models_1.default.findOne({
            order: order._id,
            isDeleted: false,
            status: 'pending',
        }).session(session);
        const trnId = (0, generateCryptoString_1.default)(10);
        if (isPaymentExists) {
            const newPayment = yield payments_models_1.default.findByIdAndUpdate(isPaymentExists === null || isPaymentExists === void 0 ? void 0 : isPaymentExists._id, { trnId }, { new: true, upsert: false, session });
            if (!newPayment) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'payment failed ');
            }
            payment = newPayment;
        }
        else {
            const adminAmount = order.totalPrice * 0.08;
            const vendorAmount = order.totalPrice * 0.92;
            // Create new payment document
            payment = yield payments_models_1.default.create([
                {
                    user: order.user,
                    author: order.author,
                    order: order._id,
                    trnId,
                    adminAmount,
                    vendorAmount,
                    price: order.totalPrice,
                },
            ], { session }).then(docs => docs[0]);
        }
        if (!payment)
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Payment creation failed');
        // Retrieve user info for Stripe customer id
        const user = yield user_models_1.User.findById(payment.user).session(session);
        if (!user)
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
        let customerId = user.customer;
        if (!customerId) {
            // Create Stripe customer if not exist
            const newCustomer = yield stripe_1.default.createCustomer(user.email, user.name);
            customerId = newCustomer.id;
            // Optionally save customerId back to user document (if you want)
            user.customer = customerId;
            yield user_models_1.User.findByIdAndUpdate(user === null || user === void 0 ? void 0 : user._id, { customer: customerId }, { new: true, upsert: false, session });
        }
        // Prepare product info for checkout
        const product = {
            amount: payment.price,
            name: 'Shopping Payment',
            quantity: 1,
        };
        console.log(product);
        const successUrl = `${config_1.default.server_url}/payments/confirm-payment?sessionId={CHECKOUT_SESSION_ID}&paymentId=${payment._id}`;
        const cancelUrl = `${config_1.default.server_url}/payments/cancel?paymentId=${payment._id}`;
        const currency = config_1.default.stripe.currency || 'usd';
        // Create Stripe checkout session
        const checkoutSession = yield stripe_1.default.getCheckoutSession(product, successUrl, cancelUrl, currency, customerId);
        yield session.commitTransaction();
        return (checkoutSession === null || checkoutSession === void 0 ? void 0 : checkoutSession.url) || null;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
const confirmPayment = (query, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { sessionId, paymentId } = query;
    const session = yield (0, mongoose_1.startSession)();
    const PaymentSession = yield stripe_1.default.getPaymentSession(sessionId);
    const paymentIntentId = PaymentSession.payment_intent;
    if (!(yield stripe_1.default.isPaymentSuccess(sessionId))) {
        throw res.render('paymentError', {
            message: 'Payment session is not completed',
            device: '',
        });
    }
    const payment = yield payments_models_1.default.findById(paymentId);
    if (!payment) {
        throw res.render('paymentError', {
            message: 'Payment Not Found!',
            device: '',
        });
    }
    if ((payment === null || payment === void 0 ? void 0 : payment.status) === payments_constants_1.PAYMENT_STATUS.paid)
        throw res.render('paymentError', {
            message: 'this payment already confirmed',
            device: '',
        });
    try {
        session.startTransaction();
        const payment = yield payments_models_1.default.findByIdAndUpdate(paymentId, { status: payments_constants_1.PAYMENT_STATUS === null || payments_constants_1.PAYMENT_STATUS === void 0 ? void 0 : payments_constants_1.PAYMENT_STATUS.paid, paymentIntentId: paymentIntentId }, { new: true, session }).populate([
            { path: 'user', select: 'name _id email phoneNumber profile ' },
            { path: 'author', select: 'name _id email phoneNumber profile' },
        ]);
        if (!payment) {
            throw res.render('paymentError', {
                message: 'Payment model not found',
                device: '',
            });
        }
        const order = yield order_models_1.default.findByIdAndUpdate(payment === null || payment === void 0 ? void 0 : payment.order, {
            status: order_constants_1.ORDER_STATUS === null || order_constants_1.ORDER_STATUS === void 0 ? void 0 : order_constants_1.ORDER_STATUS.ongoing,
            tnxId: payment === null || payment === void 0 ? void 0 : payment.trnId,
            isPaid: true,
        }, { new: true, session });
        yield user_models_1.User.findByIdAndUpdate(payment === null || payment === void 0 ? void 0 : payment.author, { $inc: { balance: payment === null || payment === void 0 ? void 0 : payment.vendorAmount } }, { session });
        if (!order) {
            throw res.render('paymentError', {
                message: 'order confirmation failed',
                device: '',
            });
        }
        // const admin = await User.findOne({ role: USER_ROLE.admin });
        // 🔽 Add this block right after the order update
        for (const item of order.items) {
            yield products_models_1.default.findByIdAndUpdate(item.product, {
                $inc: {
                    stock: -item.quantity,
                    totalSell: item.quantity,
                },
            }, { session });
        }
        notification_service_1.notificationServices.insertNotificationIntoDb({
            receiver: (_a = payment === null || payment === void 0 ? void 0 : payment.user) === null || _a === void 0 ? void 0 : _a._id,
            message: 'Payment Successful',
            description: `Your payment for the Order #"${order && order.id}" was successful.`,
            refference: payment === null || payment === void 0 ? void 0 : payment._id,
            model_type: notification_interface_1.modeType.Payments,
        });
        // For Restaurant (Seller)
        notification_service_1.notificationServices.insertNotificationIntoDb({
            receiver: (_b = payment === null || payment === void 0 ? void 0 : payment.author) === null || _b === void 0 ? void 0 : _b._id,
            message: 'New Payment Received',
            description: `You have received a payment for the Order #"${order && order.id}".`,
            refference: payment === null || payment === void 0 ? void 0 : payment._id,
            model_type: notification_interface_1.modeType.Payments,
        });
        yield session.commitTransaction();
        return payment;
    }
    catch (error) {
        yield session.abortTransaction();
        if (sessionId) {
            try {
                yield stripe_1.default.retrieve(sessionId);
            }
            catch (refundError) {
                console.error('Error processing refund:', refundError.message);
            }
        }
        throw res.render('paymentError', {
            message: error.message || 'Payment confirmation failed',
            device: '',
        });
    }
    finally {
        session.endSession();
    }
});
const getEarnings = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const { searchTerm } = query;
    const today = (0, moment_1.default)().startOf('day');
    const searchRegex = searchTerm ? new RegExp(searchTerm.trim(), 'i') : null;
    const earnings = yield payments_models_1.default.aggregate([
        {
            $match: {
                status: payments_constants_1.PAYMENT_STATUS.paid,
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
    const totalEarnings = ((_c = (_b = (_a = earnings === null || earnings === void 0 ? void 0 : earnings[0]) === null || _a === void 0 ? void 0 : _a.totalEarnings) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.total) || 0;
    const todayEarnings = ((_f = (_e = (_d = earnings === null || earnings === void 0 ? void 0 : earnings[0]) === null || _d === void 0 ? void 0 : _d.todayEarnings) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.total) || 0;
    const allData = ((_g = earnings === null || earnings === void 0 ? void 0 : earnings[0]) === null || _g === void 0 ? void 0 : _g.allData) || [];
    return { totalEarnings, todayEarnings, allData };
});
const getVendorEarnings = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const today = (0, moment_1.default)().startOf('day');
    const earnings = yield payments_models_1.default.aggregate([
        {
            $match: {
                status: payments_constants_1.PAYMENT_STATUS.paid,
                author: new mongoose_1.Types.ObjectId(userId),
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
    const totalEarnings = ((earnings === null || earnings === void 0 ? void 0 : earnings.length) > 0 &&
        ((_b = (_a = earnings[0]) === null || _a === void 0 ? void 0 : _a.totalEarnings) === null || _b === void 0 ? void 0 : _b.length) > 0 &&
        ((_d = (_c = earnings[0]) === null || _c === void 0 ? void 0 : _c.totalEarnings[0]) === null || _d === void 0 ? void 0 : _d.total)) ||
        0;
    const todayEarnings = ((earnings === null || earnings === void 0 ? void 0 : earnings.length) > 0 &&
        ((_f = (_e = earnings[0]) === null || _e === void 0 ? void 0 : _e.todayEarnings) === null || _f === void 0 ? void 0 : _f.length) > 0 &&
        ((_h = (_g = earnings[0]) === null || _g === void 0 ? void 0 : _g.todayEarnings[0]) === null || _h === void 0 ? void 0 : _h.total)) ||
        0;
    const allData = ((_j = earnings[0]) === null || _j === void 0 ? void 0 : _j.allData) || [];
    return { totalEarnings, todayEarnings, allData };
});
const dashboardData = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    // Income Year Setup
    const year = query.incomeYear ? Number(query.incomeYear) : (0, moment_1.default)().year();
    const startOfYear = (0, moment_1.default)().year(year).startOf('year');
    const endOfYear = (0, moment_1.default)().year(year).endOf('year');
    // Aggregate payments data
    const earnings = yield payments_models_1.default.aggregate([
        {
            $match: {
                status: payments_constants_1.PAYMENT_STATUS.paid,
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
    const totalEarnings = ((_c = (_b = (_a = earnings === null || earnings === void 0 ? void 0 : earnings[0]) === null || _a === void 0 ? void 0 : _a.totalEarnings) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.total) || 0;
    const monthlyIncomeRaw = ((_d = earnings === null || earnings === void 0 ? void 0 : earnings[0]) === null || _d === void 0 ? void 0 : _d.monthlyIncome) || [];
    const formattedMonthlyIncome = Array.from({ length: 12 }, (_, i) => ({
        month: (0, moment_1.default)().month(i).format('MMM'),
        income: 0,
    }));
    monthlyIncomeRaw.forEach((entry) => {
        formattedMonthlyIncome[entry._id.month - 1].income = Math.round(entry.income);
    });
    // User Year Setup
    const userYear = query.JoinYear ? Number(query.JoinYear) : (0, moment_1.default)().year();
    const startOfUserYear = (0, moment_1.default)().year(userYear).startOf('year');
    const endOfUserYear = (0, moment_1.default)().year(userYear).endOf('year');
    // Aggregate user data
    const usersData = yield user_models_1.User.aggregate([
        {
            $facet: {
                totalRegistration: [
                    {
                        $match: {
                            'verification.status': true,
                            isDeleted: false,
                            role: { $ne: user_constants_1.USER_ROLE.admin },
                        },
                    },
                    { $count: 'count' },
                ],
                totalVendor: [
                    {
                        $match: {
                            role: user_constants_1.USER_ROLE.vendor,
                            'verification.status': true,
                            isDeleted: false,
                        },
                    },
                    { $count: 'count' },
                ],
                totalUsers: [
                    {
                        $match: {
                            role: user_constants_1.USER_ROLE.user,
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
                            role: query.role === user_constants_1.USER_ROLE.user
                                ? user_constants_1.USER_ROLE.user
                                : user_constants_1.USER_ROLE.vendor,
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
                    { $match: { role: { $ne: user_constants_1.USER_ROLE.admin } } },
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
    const totalUsers = ((_g = (_f = (_e = usersData === null || usersData === void 0 ? void 0 : usersData[0]) === null || _e === void 0 ? void 0 : _e.totalUsers) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.count) || 0;
    const totalProducts = yield products_models_1.default.countDocuments({ isDeleted: false });
    const totalRegistration = ((_k = (_j = (_h = usersData === null || usersData === void 0 ? void 0 : usersData[0]) === null || _h === void 0 ? void 0 : _h.totalRegistration) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.count) || 0;
    const totalVendor = ((_o = (_m = (_l = usersData === null || usersData === void 0 ? void 0 : usersData[0]) === null || _l === void 0 ? void 0 : _l.totalVendor) === null || _m === void 0 ? void 0 : _m[0]) === null || _o === void 0 ? void 0 : _o.count) || 0;
    const monthlyUserRaw = ((_p = usersData === null || usersData === void 0 ? void 0 : usersData[0]) === null || _p === void 0 ? void 0 : _p.monthlyUser) || [];
    const userDetails = ((_q = usersData === null || usersData === void 0 ? void 0 : usersData[0]) === null || _q === void 0 ? void 0 : _q.userDetails) || [];
    // Format monthly user registrations
    const formattedMonthlyUsers = Array.from({ length: 12 }, (_, i) => ({
        month: (0, moment_1.default)().month(i).format('MMM'),
        total: 0,
    }));
    monthlyUserRaw.forEach((entry) => {
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
});
const vendorDashboardData = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    // Income Year Setup
    const year = query.incomeYear ? Number(query.incomeYear) : (0, moment_1.default)().year();
    const startOfYear = (0, moment_1.default)().year(year).startOf('year');
    const endOfYear = (0, moment_1.default)().year(year).endOf('year');
    // Aggregate payments data
    const earnings = yield payments_models_1.default.aggregate([
        {
            $match: {
                status: payments_constants_1.PAYMENT_STATUS.paid,
                author: new mongoose_1.Types.ObjectId(query.author),
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
    const totalEarnings = ((_c = (_b = (_a = earnings === null || earnings === void 0 ? void 0 : earnings[0]) === null || _a === void 0 ? void 0 : _a.totalEarnings) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.total) || 0;
    const monthlyIncomeRaw = ((_d = earnings === null || earnings === void 0 ? void 0 : earnings[0]) === null || _d === void 0 ? void 0 : _d.monthlyIncome) || [];
    const formattedMonthlyIncome = Array.from({ length: 12 }, (_, i) => ({
        month: (0, moment_1.default)().month(i).format('MMM'),
        income: 0,
    }));
    monthlyIncomeRaw.forEach((entry) => {
        formattedMonthlyIncome[entry._id.month - 1].income = Math.round(entry.income);
    });
    const totalProducts = yield products_models_1.default.countDocuments({
        author: query.author,
    });
    return {
        totalIncome: totalEarnings,
        totalProducts,
        monthlyIncome: formattedMonthlyIncome,
    };
});
const getAllPayments = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const paymentsModel = new QueryBuilder_1.default(payments_models_1.default.find({ isDeleted: false }), query)
        .search([''])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield paymentsModel.modelQuery;
    const meta = yield paymentsModel.countTotal();
    return {
        data,
        meta,
    };
});
const getPaymentsById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payments_models_1.default.findById(id);
    if (!result || (result === null || result === void 0 ? void 0 : result.isDeleted)) {
        throw new Error('Payments not found!');
    }
    return result;
});
const getPaymentsByOrderId = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payments_models_1.default.findOne({ order: orderId }).populate([
        { path: 'user', select: 'name' },
    ]);
    if (!result || (result === null || result === void 0 ? void 0 : result.isDeleted)) {
        throw new Error('Payments not found!');
    }
    return result;
});
const updatePayments = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payments_models_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new Error('Failed to update Payments');
    }
    return result;
});
const deletePayments = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payments_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete payments');
    }
    return result;
});
exports.paymentsService = {
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
