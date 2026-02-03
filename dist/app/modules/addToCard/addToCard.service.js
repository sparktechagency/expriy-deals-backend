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
exports.addToCardService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const addToCard_models_1 = __importDefault(require("./addToCard.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const createAddToCard = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExisting = yield addToCard_models_1.default.findOne({
        product: payload.product,
        user: payload.user,
    });
    if (isExisting) {
        const result = yield addToCard_models_1.default.findByIdAndUpdate(isExisting.id, { quantity: isExisting.quantity + 1 }, { new: true });
        return result;
    }
    const result = yield addToCard_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create addToCard');
    }
    return result;
});
const getAllAddToCard = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const addToCardModel = new QueryBuilder_1.default(addToCard_models_1.default.find().populate([
        { path: 'user', select: 'name email phoneNumber profile' },
        {
            path: 'product',
            populate: [
                {
                    path: 'author',
                    select: 'name email profile phoneNumber shop',
                    populate: { path: 'shop' },
                },
                { path: 'category', select: 'name banner' },
            ],
        },
    ]), query)
        .search([''])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield addToCardModel.modelQuery;
    const meta = yield addToCardModel.countTotal();
    return {
        data,
        meta,
    };
});
const getAddToCardById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield addToCard_models_1.default.findById(id).populate([
        { path: 'user', select: 'name email phoneNumber profile' },
        { path: 'product', populate: { path: 'category' } },
    ]);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'AddToCard not found!');
    }
    return result;
});
const updateAddToCard = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield addToCard_models_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to update AddToCard');
    }
    return result;
});
const emptyMyCard = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield addToCard_models_1.default.deleteMany({
        user: id,
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete addToCard');
    }
    return result;
});
const deleteAddToCard = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield addToCard_models_1.default.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete addToCard');
    }
    return result;
});
exports.addToCardService = {
    createAddToCard,
    getAllAddToCard,
    getAddToCardById,
    updateAddToCard,
    deleteAddToCard,
    emptyMyCard,
};
