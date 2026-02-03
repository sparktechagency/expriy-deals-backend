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
exports.bankDetailsController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const bankDetails_service_1 = require("./bankDetails.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createBankDetails = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.body.vendor = req.user.userId;
    const result = yield bankDetails_service_1.bankDetailsService.createBankDetails(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'BankDetails created successfully',
        data: result,
    });
}));
const getAllBankDetails = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield bankDetails_service_1.bankDetailsService.getAllBankDetails(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All bankDetails fetched successfully',
        data: result,
    });
}));
const getBankDetailsById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield bankDetails_service_1.bankDetailsService.getBankDetailsById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'BankDetails fetched successfully',
        data: result,
    });
}));
const getBankDetailsByVendorId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield bankDetails_service_1.bankDetailsService.getBankDetailsByVendorId(req.user.userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'my fetched successfully',
        data: result,
    });
}));
const updateBankDetails = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield bankDetails_service_1.bankDetailsService.updateBankDetails(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'BankDetails updated successfully',
        data: result,
    });
}));
const deleteBankDetails = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield bankDetails_service_1.bankDetailsService.deleteBankDetails(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'BankDetails deleted successfully',
        data: result,
    });
}));
exports.bankDetailsController = {
    createBankDetails,
    getAllBankDetails,
    getBankDetailsById,
    updateBankDetails,
    getBankDetailsByVendorId,
    deleteBankDetails,
};
