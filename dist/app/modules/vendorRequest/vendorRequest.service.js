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
exports.vendorRequestService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const vendorRequest_models_1 = __importDefault(require("./vendorRequest.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const notification_service_1 = require("../notification/notification.service");
const user_models_1 = require("../user/user.models");
const user_constants_1 = require("../user/user.constants");
const notification_interface_1 = require("../notification/notification.interface");
const shop_models_1 = __importDefault(require("../shop/shop.models"));
const generateCryptoString_1 = __importDefault(require("../../utils/generateCryptoString"));
const path_1 = __importDefault(require("path"));
const mailSender_1 = require("../../utils/mailSender");
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = require("mongoose");
const s3_1 = require("../../utils/s3");
const createVendorRequest = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield user_models_1.User.isUserExist(payload.email);
    if (isExist)
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'this email already exist using another email');
    const isRequestExist = yield vendorRequest_models_1.default.findOne({ email: payload.email });
    if (isRequestExist)
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'already using this email request a user, try another email');
    if (file) {
        payload.document = (yield (0, s3_1.uploadToS3)({
            file: file,
            fileName: `images/vendor/documents/${Math.floor(100000 + Math.random() * 900000)}${Date.now()}}`,
        }));
    }
    const result = yield vendorRequest_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create vendorRequest');
    }
    const admin = yield user_models_1.User.findOne({ role: user_constants_1.USER_ROLE.admin });
    yield notification_service_1.notificationServices.insertNotificationIntoDb({
        receiver: admin === null || admin === void 0 ? void 0 : admin._id, // Replace with actual admin user ID or logic to get admin(s)
        message: 'New Vendor Account Request',
        description: `A new vendor account request has been submitted by ${(result === null || result === void 0 ? void 0 : result.name) || 'a user'}. Please review and approve the request.`,
        refference: result === null || result === void 0 ? void 0 : result._id, // Replace with actual request ID if applicable
        model_type: notification_interface_1.modeType.VendorRequest, // Ensure this enum/type exists
    });
    return result;
});
const getAllVendorRequest = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const vendorRequestModel = new QueryBuilder_1.default(vendorRequest_models_1.default.find(), query)
        .search(['name', 'email'])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield vendorRequestModel.modelQuery;
    const meta = yield vendorRequestModel.countTotal();
    return {
        data,
        meta,
    };
});
const getVendorRequestById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vendorRequest_models_1.default.findById(id);
    if (!result) {
        throw new Error('VendorRequest not found!');
    }
    return result;
});
const updateVendorRequest = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vendorRequest_models_1.default.findByIdAndUpdate(id, payload, {
        new: true,
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to update VendorRequest');
    }
    return result;
});
const approveVendorRequest = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, mongoose_1.startSession)();
    session.startTransaction();
    try {
        const result = yield vendorRequest_models_1.default.findById(id).session(session);
        if (!result) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Request not found');
        }
        const password = (0, generateCryptoString_1.default)(10);
        const user = yield user_models_1.User.create([
            {
                name: result.name,
                email: result.email,
                role: user_constants_1.USER_ROLE.vendor,
                expireAt: null,
                password,
                verification: { status: true },
            },
        ], { session });
        const shop = yield shop_models_1.default.create([
            {
                name: result.shopName,
                location: result.location,
                document: result.document,
                author: user[0]._id,
            },
        ], { session });
        if (!shop) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Shop creation failed');
        }
        yield user_models_1.User.findByIdAndUpdate(user[0]._id, { shop: shop[0]._id }, { session });
        const otpEmailPath = path_1.default.join(__dirname, '../../../../public/view/vendor_account_created.html');
        yield (0, mailSender_1.sendEmail)(result.email, 'Your Vendor Request has been approved', fs_1.default
            .readFileSync(otpEmailPath, 'utf8')
            .replace('{{vendor_name}}', result.name)
            .replace('{{account_email}}', result.email)
            .replace('{{account_password}}', password));
        yield vendorRequest_models_1.default.findByIdAndDelete(result._id, { session });
        yield session.commitTransaction();
        session.endSession();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const rejectVendorRequest = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vendorRequest_models_1.default.findById(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to update VendorRequest');
    }
    if (result.document) {
        yield (0, s3_1.deleteFromS3)(result === null || result === void 0 ? void 0 : result.document);
    }
    const otpEmailPath = path_1.default.join(__dirname, '../../../../public/view/reject_vendor_request.html');
    yield (0, mailSender_1.sendEmail)(result === null || result === void 0 ? void 0 : result.email, 'Your Vendor Request has been rejected', fs_1.default
        .readFileSync(otpEmailPath, 'utf8')
        .replace('{{vendor_name}}', result === null || result === void 0 ? void 0 : result.name)
        .replace('{{request}}', payload === null || payload === void 0 ? void 0 : payload.reason));
    yield vendorRequest_models_1.default.findByIdAndDelete(id);
    return result;
});
const deleteVendorRequest = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vendorRequest_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete vendorRequest');
    }
    return result;
});
exports.vendorRequestService = {
    createVendorRequest,
    getAllVendorRequest,
    getVendorRequestById,
    updateVendorRequest,
    deleteVendorRequest,
    rejectVendorRequest,
    approveVendorRequest,
};
