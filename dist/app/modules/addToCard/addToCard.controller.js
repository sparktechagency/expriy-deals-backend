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
exports.addToCardController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const addToCard_service_1 = require("./addToCard.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createAddToCard = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.body.user = req.user.userId;
    const result = yield addToCard_service_1.addToCardService.createAddToCard(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'AddToCard created successfully',
        data: result,
    });
}));
const getAllAddToCard = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.user.userId);
    req.query.user = req.user.userId;
    const result = yield addToCard_service_1.addToCardService.getAllAddToCard(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All addToCard fetched successfully',
        data: result,
    });
}));
const getAddToCardById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.user.userId);
    const result = yield addToCard_service_1.addToCardService.getAddToCardById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'AddToCard fetched successfully',
        data: result,
    });
}));
const updateAddToCard = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield addToCard_service_1.addToCardService.updateAddToCard(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'AddToCard updated successfully',
        data: result,
    });
}));
const deleteAddToCard = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield addToCard_service_1.addToCardService.deleteAddToCard(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'AddToCard deleted successfully',
        data: result,
    });
}));
const emptyMyCard = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield addToCard_service_1.addToCardService.emptyMyCard(req.user.userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'AddToCard emptied successfully',
        data: result,
    });
}));
exports.addToCardController = {
    createAddToCard,
    getAllAddToCard,
    getAddToCardById,
    updateAddToCard,
    deleteAddToCard,
    emptyMyCard,
};
