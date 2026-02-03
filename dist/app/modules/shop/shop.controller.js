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
exports.shopController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const shop_service_1 = require("./shop.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createShop = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shop_service_1.shopService.createShop(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Shop created successfully',
        data: result,
    });
}));
const getAllShop = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shop_service_1.shopService.getAllShop(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All shop fetched successfully',
        data: result,
    });
}));
const getShopById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shop_service_1.shopService.getShopById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Shop fetched successfully',
        data: result,
    });
}));
const getMyShopById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shop_service_1.shopService.getMyShopById(req.user.userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Shop fetched successfully',
        data: result,
    });
}));
const updateShop = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shop_service_1.shopService.updateShop(req.params.id, req.body, req.files);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Shop updated successfully',
        data: result,
    });
}));
const updateMyShop = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shop_service_1.shopService.updateMyShop(req.user.userId, req.body, req.files);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Shop updated successfully',
        data: result,
    });
}));
const deleteShop = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shop_service_1.shopService.deleteShop(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Shop deleted successfully',
        data: result,
    });
}));
exports.shopController = {
    createShop,
    getAllShop,
    getShopById,
    updateShop, getMyShopById,
    deleteShop,
    updateMyShop,
};
