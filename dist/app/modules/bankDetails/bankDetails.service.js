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
exports.bankDetailsService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const bankDetails_models_1 = __importDefault(require("./bankDetails.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const createBankDetails = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield bankDetails_models_1.default.findOne({ vendor: payload.vendor });
    if (isExist) {
        const result = yield bankDetails_models_1.default.findByIdAndUpdate(isExist._id, payload, {
            new: true,
        });
        return result;
    }
    const result = yield bankDetails_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create bankDetails');
    }
    return result;
});
const getAllBankDetails = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const bankDetailsModel = new QueryBuilder_1.default(bankDetails_models_1.default.find(), query)
        .search([''])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield bankDetailsModel.modelQuery;
    const meta = yield bankDetailsModel.countTotal();
    return {
        data,
        meta,
    };
});
const getBankDetailsById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield bankDetails_models_1.default.findById(id);
    if (!result) {
        throw new Error('BankDetails not found!');
    }
    return result;
});
const getBankDetailsByVendorId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield bankDetails_models_1.default.findByVendorId(id);
    if (!result) {
        throw new Error('BankDetails not found!');
    }
    return result;
});
const updateBankDetails = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield bankDetails_models_1.default.findByIdAndUpdate(id, payload, {
        new: true,
    });
    if (!result) {
        throw new Error('Failed to update BankDetails');
    }
    return result;
});
const deleteBankDetails = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield bankDetails_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete bankDetails');
    }
    return result;
});
exports.bankDetailsService = {
    createBankDetails,
    getAllBankDetails,
    getBankDetailsById,
    updateBankDetails,
    deleteBankDetails,
    getBankDetailsByVendorId,
};
