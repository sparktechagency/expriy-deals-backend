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
exports.stripeController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const stripe_service_1 = require("./stripe.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const stripLinkAccount = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield stripe_service_1.stripeService.stripLinkAccount((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Account creation URL generated successfully.',
    });
}));
const handleStripeOAuth = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    yield stripe_service_1.stripeService.handleStripeOAuth(req.query, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    // Redirect to home or a specific page after successful OAuth
    res.redirect('/');
}));
const refresh = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log((_a = req.params) === null || _a === void 0 ? void 0 : _a.id);
    console.log(req.query);
    const result = yield stripe_service_1.stripeService.refresh((_b = req.params) === null || _b === void 0 ? void 0 : _b.id, req.query);
    // Remove sendResponse after res.redirect to avoid setting headers twice
    res.redirect(result);
}));
const returnUrl = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield stripe_service_1.stripeService.returnUrl(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Stripe account updated successfully.',
    });
}));
exports.stripeController = {
    stripLinkAccount,
    handleStripeOAuth,
    refresh,
    returnUrl,
};
