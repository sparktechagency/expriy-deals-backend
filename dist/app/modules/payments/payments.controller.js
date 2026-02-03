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
exports.paymentsController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const payments_service_1 = require("./payments.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const createPayments = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.body['user'] = req.user.userId;
    const result = yield payments_service_1.paymentsService.createPayments(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Payments created successfully',
        data: result,
    });
}));
const confirmPayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payments_service_1.paymentsService.confirmPayment(req === null || req === void 0 ? void 0 : req.query, res);
    // res.redirect(`${config.success_url}?subscriptionId=${result?.subscription}`);
    res.render('paymentSuccess', {
        paymentDetails: result,
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'payment successful',
    });
}));
const dashboardData = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payments_service_1.paymentsService.dashboardData(req === null || req === void 0 ? void 0 : req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'dashboard data successful',
    });
}));
const vendorDashboardData = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.query.author = req.user.userId;
    const result = yield payments_service_1.paymentsService.vendorDashboardData(req === null || req === void 0 ? void 0 : req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'dashboard data successful',
    });
}));
const getEarnings = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payments_service_1.paymentsService.getEarnings(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'earnings data successful',
    });
}));
const getVendorEarnings = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payments_service_1.paymentsService.getVendorEarnings(req.user.userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'earnings data successful',
    });
}));
const getAllPayments = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payments_service_1.paymentsService.getAllPayments(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All payments fetched successfully',
        data: result,
    });
}));
const getPaymentsById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payments_service_1.paymentsService.getPaymentsById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Payments fetched successfully',
        data: result,
    });
}));
const getPaymentsByOrderId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payments_service_1.paymentsService.getPaymentsByOrderId(req.params.orderId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Get payment by orderId successfully',
        data: result,
    });
}));
const updatePayments = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payments_service_1.paymentsService.updatePayments(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Payments updated successfully',
        data: result,
    });
}));
const deletePayments = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payments_service_1.paymentsService.deletePayments(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Payments deleted successfully',
        data: result,
    });
}));
exports.paymentsController = {
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
