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
exports.withdrawRequestController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const withdrawRequest_service_1 = require("./withdrawRequest.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createWithdrawRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.body.vendor = req.user.userId;
    const result = yield withdrawRequest_service_1.withdrawRequestService.createWithdrawRequest(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'WithdrawRequest created successfully',
        data: result,
    });
}));
const getAllWithdrawRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield withdrawRequest_service_1.withdrawRequestService.getAllWithdrawRequest(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All withdrawRequest fetched successfully',
        data: result,
    });
}));
const getMyWithdrawRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.query['vendor'] = req.user.userId;
    console.log(req.body);
    const result = yield withdrawRequest_service_1.withdrawRequestService.getAllWithdrawRequest(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All withdrawRequest fetched successfully',
        data: result,
    });
}));
const getWithdrawRequestById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield withdrawRequest_service_1.withdrawRequestService.getWithdrawRequestById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'WithdrawRequest fetched successfully',
        data: result,
    });
}));
const updateWithdrawRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield withdrawRequest_service_1.withdrawRequestService.updateWithdrawRequest(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'WithdrawRequest updated successfully',
        data: result,
    });
}));
const approvedWithdrawRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield withdrawRequest_service_1.withdrawRequestService.approvedWithdrawRequest(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Approved withdraw request successfully',
        data: result,
    });
}));
const rejectWithdrawRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield withdrawRequest_service_1.withdrawRequestService.rejectWithdrawRequest(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Reject withdraw request successfully',
        data: result,
    });
}));
const deleteWithdrawRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield withdrawRequest_service_1.withdrawRequestService.deleteWithdrawRequest(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'WithdrawRequest deleted successfully',
        data: result,
    });
}));
exports.withdrawRequestController = {
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
