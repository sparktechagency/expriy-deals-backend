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
exports.orderService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const order_models_1 = __importDefault(require("./order.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const products_models_1 = __importDefault(require("../products/products.models"));
const createOrder = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    for (const item of payload.items) {
        const product = yield products_models_1.default.findById(item.product);
        if (!product) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Product is not found!');
        }
        // unit price after discount
        const unitPrice = product.discount && product.discount > 0
            ? product.price - (product.price * product.discount) / 100
            : product.price;
        item.price = parseFloat(unitPrice.toFixed(2));
        item.discount = product.discount || 0;
    }
    // subtotal (after discount × quantity)
    const subTotal = payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = 0.0825; // 8.25%
    const taxAmount = subTotal * taxRate;
    payload.totalPrice = parseFloat((subTotal + taxAmount).toFixed(2));
    const result = yield order_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create order');
    }
    return result;
});
const getAllOrder = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const orderModel = new QueryBuilder_1.default(order_models_1.default.find({ isDeleted: false }).populate([
        {
            path: 'items.product',
            populate: [
                {
                    path: 'author',
                    select: 'name email profile phoneNumber shop',
                    populate: { path: 'shop' },
                },
                { path: 'category', select: 'name banner' },
            ],
        },
        {
            path: 'author',
            select: 'name email phoneNumber profile',
            populate: [{ path: 'shop', select: 'name logo banner bannerColor' }],
        },
        { path: 'user', select: 'name email phoneNumber profile' },
    ]), query)
        .search([''])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield orderModel.modelQuery;
    const meta = yield orderModel.countTotal();
    return {
        data,
        meta,
    };
});
const getOrderById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield order_models_1.default.findById(id).populate([
        {
            path: 'items.product',
            populate: [
                {
                    path: 'author',
                    select: 'name email profile phoneNumber shop',
                    populate: { path: 'shop' },
                },
                { path: 'category', select: 'name banner' },
            ],
        },
        { path: 'author', select: 'name email phoneNumber profile' },
    ]);
    if (!result || (result === null || result === void 0 ? void 0 : result.isDeleted)) {
        throw new Error('Order not found!');
    }
    return result;
});
const updateOrder = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield order_models_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new Error('Failed to update Order');
    }
    return result;
});
const deleteOrder = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield order_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete order');
    }
    return result;
});
exports.orderService = {
    createOrder,
    getAllOrder,
    getOrderById,
    updateOrder,
    deleteOrder,
};
