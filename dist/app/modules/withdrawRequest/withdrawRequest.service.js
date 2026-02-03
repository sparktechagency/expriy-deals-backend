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
exports.withdrawRequestService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const withdrawRequest_models_1 = __importDefault(require("./withdrawRequest.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const bankDetails_models_1 = __importDefault(require("../bankDetails/bankDetails.models"));
const user_models_1 = require("../user/user.models");
const notification_service_1 = require("../notification/notification.service");
const user_constants_1 = require("../user/user.constants");
const notification_interface_1 = require("../notification/notification.interface");
const createWithdrawRequest = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const bankDetails = yield bankDetails_models_1.default.findByVendorId((_a = payload === null || payload === void 0 ? void 0 : payload.vendor) === null || _a === void 0 ? void 0 : _a.toString());
    if (!bankDetails) {
        throw new AppError_1.default(http_status_1.default === null || http_status_1.default === void 0 ? void 0 : http_status_1.default.BAD_REQUEST, "You don't have Bank detail. first add bank details then try again");
    }
    const user = yield user_models_1.User.findById(payload === null || payload === void 0 ? void 0 : payload.vendor);
    if (!user)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'vendor not found');
    if (Number(payload === null || payload === void 0 ? void 0 : payload.amount) > Number(user === null || user === void 0 ? void 0 : user.balance)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Insufficient balance');
    }
    payload.bankDetails = bankDetails === null || bankDetails === void 0 ? void 0 : bankDetails._id;
    const result = yield withdrawRequest_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create withdrawRequest');
    }
    const admin = yield user_models_1.User.findOne({ role: user_constants_1.USER_ROLE.admin });
    yield notification_service_1.notificationServices.insertNotificationIntoDb({
        receiver: admin === null || admin === void 0 ? void 0 : admin._id,
        message: 'New Withdrawal Request Submitted',
        description: `A new withdrawal request has been submitted by ${(_b = user === null || user === void 0 ? void 0 : user.name) !== null && _b !== void 0 ? _b : 'a user'} for the amount of $${(_c = result === null || result === void 0 ? void 0 : result.amount) !== null && _c !== void 0 ? _c : 'N/A'}.`,
        refference: result === null || result === void 0 ? void 0 : result._id,
        model_type: notification_interface_1.modeType.WithdrawRequest,
    });
    return result;
});
const getAllWithdrawRequest = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const withdrawRequestModel = new QueryBuilder_1.default(withdrawRequest_models_1.default.find().populate([
        {
            path: 'vendor',
            select: 'name email phoneNumber profile',
        },
        {
            path: 'bankDetails',
        },
    ]), query)
        .search([''])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield withdrawRequestModel.modelQuery;
    const meta = yield withdrawRequestModel.countTotal();
    return {
        data,
        meta,
    };
});
const getWithdrawRequestById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield withdrawRequest_models_1.default.findById(id).populate({
        path: 'vendor',
        select: 'name email phoneNumber profile',
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'WithdrawRequest not found!');
    }
    return result;
});
const updateWithdrawRequest = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield withdrawRequest_models_1.default.findByIdAndUpdate(id, payload, {
        new: true,
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to update WithdrawRequest');
    }
    return result;
});
const approvedWithdrawRequest = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield withdrawRequest_models_1.default.findByIdAndUpdate(id, { status: 'approved', refNumber: payload === null || payload === void 0 ? void 0 : payload.refNumber }, {
        new: true,
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to update WithdrawRequest');
    }
    yield notification_service_1.notificationServices.insertNotificationIntoDb({
        receiver: result === null || result === void 0 ? void 0 : result.vendor,
        message: 'Withdrawal Request Approved',
        description: `Your withdrawal request of $${(result === null || result === void 0 ? void 0 : result.amount) || 'N/A'} has been approved Ref.Number:${payload === null || payload === void 0 ? void 0 : payload.refNumber} and is being processed.`,
        refference: result === null || result === void 0 ? void 0 : result._id,
        model_type: notification_interface_1.modeType.WithdrawRequest,
    });
    return result;
});
const rejectWithdrawRequest = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield withdrawRequest_models_1.default.findByIdAndUpdate(id, { status: 'rejected', reason: payload === null || payload === void 0 ? void 0 : payload.reason }, {
        new: true,
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to update WithdrawRequest');
    }
    yield notification_service_1.notificationServices.insertNotificationIntoDb({
        receiver: result === null || result === void 0 ? void 0 : result.vendor,
        message: 'Withdrawal Request Rejected',
        description: `Your withdrawal request of $${(result === null || result === void 0 ? void 0 : result.amount) || 'N/A'} has been rejected by the admin.`,
        refference: result === null || result === void 0 ? void 0 : result._id,
        model_type: notification_interface_1.modeType.WithdrawRequest,
    });
    return result;
});
const deleteWithdrawRequest = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield withdrawRequest_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete withdrawRequest');
    }
    return result;
});
exports.withdrawRequestService = {
    createWithdrawRequest,
    getAllWithdrawRequest,
    getWithdrawRequestById,
    updateWithdrawRequest,
    deleteWithdrawRequest,
    // myWithdrawRequest,
    rejectWithdrawRequest,
    approvedWithdrawRequest,
};
