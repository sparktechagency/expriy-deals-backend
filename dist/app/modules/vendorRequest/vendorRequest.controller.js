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
exports.vendorRequestController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const vendorRequest_service_1 = require("./vendorRequest.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createVendorRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vendorRequest_service_1.vendorRequestService.createVendorRequest(req.body, req.file);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'VendorRequest created successfully',
        data: result,
    });
}));
const getAllVendorRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vendorRequest_service_1.vendorRequestService.getAllVendorRequest(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All vendorRequest fetched successfully',
        data: result,
    });
}));
const getVendorRequestById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vendorRequest_service_1.vendorRequestService.getVendorRequestById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'VendorRequest fetched successfully',
        data: result,
    });
}));
const updateVendorRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vendorRequest_service_1.vendorRequestService.updateVendorRequest(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'VendorRequest updated successfully',
        data: result,
    });
}));
const approveVendorRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vendorRequest_service_1.vendorRequestService.approveVendorRequest(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'VendorRequest approved successfully',
        data: result,
    });
}));
const rejectVendorRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vendorRequest_service_1.vendorRequestService.rejectVendorRequest(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'VendorRequest rejected successfully',
        data: result,
    });
}));
const deleteVendorRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vendorRequest_service_1.vendorRequestService.deleteVendorRequest(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'VendorRequest deleted successfully',
        data: result,
    });
}));
exports.vendorRequestController = {
    createVendorRequest,
    getAllVendorRequest,
    getVendorRequestById,
    updateVendorRequest,
    deleteVendorRequest,
    rejectVendorRequest,
    approveVendorRequest,
};
