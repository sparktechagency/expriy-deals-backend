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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const shop_models_1 = __importDefault(require("./shop.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const s3_1 = require("../../utils/s3");
const pickQuery_1 = __importDefault(require("../../utils/pickQuery"));
const mongoose_1 = require("mongoose");
const pagination_helpers_1 = require("../../helpers/pagination.helpers");
const createShop = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shop_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create shop');
    }
    return result;
});
const getAllShop = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { filters, pagination } = yield (0, pickQuery_1.default)(query);
    const { searchTerm, latitude, longitude } = filters, filtersData = __rest(filters, ["searchTerm", "latitude", "longitude"]);
    console.log({ latitude, longitude });
    if (filtersData === null || filtersData === void 0 ? void 0 : filtersData.author) {
        filtersData['author'] = new mongoose_1.Types.ObjectId(filtersData === null || filtersData === void 0 ? void 0 : filtersData.author);
    }
    // Initialize the aggregation pipeline
    const pipeline = [];
    // If latitude and longitude are provided, add $geoNear to the aggregation pipeline
    if (latitude && longitude) {
        pipeline.push({
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [Number(longitude), Number(latitude)],
                },
                key: 'location',
                maxDistance: parseFloat(5) * 1609, // 5 miles to meters
                distanceField: 'dist.calculated',
                spherical: true,
            },
        });
        // convert to KM
        pipeline.push({
            $addFields: {
                distanceKm: {
                    $divide: ['$dist.calculated', 1000],
                },
            },
        });
    }
    // Add a match to exclude deleted documents
    pipeline.push({
        $match: {
            isDeleted: false,
        },
    });
    // If searchTerm is provided, add a search condition
    if (searchTerm) {
        pipeline.push({
            $match: {
                $or: ['name', 'description'].map(field => ({
                    [field]: {
                        $regex: searchTerm,
                        $options: 'i',
                    },
                })),
            },
        });
    }
    if (Object.entries(filtersData).length) {
        // Add custom filters (filtersData) to the aggregation pipeline
        Object.entries(filtersData).map(([field, value]) => {
            if (/^\[.*?\]$/.test(value)) {
                const match = value.match(/\[(.*?)\]/);
                const queryValue = match ? match[1] : value;
                pipeline.push({
                    $match: {
                        [field]: { $in: [new mongoose_1.Types.ObjectId(queryValue)] },
                    },
                });
                delete filtersData[field];
            }
        });
        if (Object.entries(filtersData).length) {
            pipeline.push({
                $match: {
                    $and: Object.entries(filtersData).map(([field, value]) => ({
                        isDeleted: false,
                        [field]: value,
                    })),
                },
            });
        }
    }
    // Sorting condition
    const { page, limit, skip, sort } = pagination_helpers_1.paginationHelper.calculatePagination(pagination);
    if (sort) {
        const sortArray = sort.split(',').map(field => {
            const trimmedField = field.trim();
            if (trimmedField.startsWith('-')) {
                return { [trimmedField.slice(1)]: -1 };
            }
            return { [trimmedField]: 1 };
        });
        pipeline.push({ $sort: Object.assign({}, ...sortArray) });
    }
    pipeline.push({
        $facet: {
            totalData: [{ $count: 'total' }],
            paginatedData: [
                { $skip: skip },
                { $limit: limit },
                // Lookups
                {
                    $lookup: {
                        from: 'users',
                        localField: 'author',
                        foreignField: '_id',
                        as: 'author',
                        pipeline: [
                            {
                                $project: {
                                    name: 1,
                                    email: 1,
                                    phoneNumber: 1,
                                    profile: 1,
                                },
                            },
                        ],
                    },
                },
                {
                    $addFields: {
                        author: { $arrayElemAt: ['$author', 0] },
                    },
                },
            ],
        },
    });
    const [result] = yield shop_models_1.default.aggregate(pipeline);
    const total = ((_b = (_a = result === null || result === void 0 ? void 0 : result.totalData) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
    const data = (result === null || result === void 0 ? void 0 : result.paginatedData) || [];
    return {
        meta: { page, limit, total },
        data,
    };
});
const getShopById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shop_models_1.default.findById(id).populate([
        { path: 'author', select: 'name email profile phoneNumber' },
    ]);
    if (!result || (result === null || result === void 0 ? void 0 : result.isDeleted)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Shop not found!');
    }
    return result;
});
const getMyShopById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shop_models_1.default.findOne({ author: id }).populate([
        { path: 'author', select: 'name email profile phoneNumber' },
    ]);
    if (!result || (result === null || result === void 0 ? void 0 : result.isDeleted)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Shop not found!');
    }
    return result;
});
const updateShop = (id, payload, files) => __awaiter(void 0, void 0, void 0, function* () {
    if (files) {
        const { logo, banner } = files;
        if (logo === null || logo === void 0 ? void 0 : logo.length) {
            payload.logo = (yield (0, s3_1.uploadToS3)({
                file: logo[0],
                fileName: `images/shop/logo/${Math.floor(100000 + Math.random() * 900000)}`,
            }));
        }
        if (banner === null || banner === void 0 ? void 0 : banner.length) {
            payload.banner = (yield (0, s3_1.uploadToS3)({
                file: banner[0],
                fileName: `images/shop/banner/${Math.floor(100000 + Math.random() * 900000)}`,
            }));
        }
    }
    const result = yield shop_models_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to update Shop');
    }
    return result;
});
const updateMyShop = (userId, payload, files) => __awaiter(void 0, void 0, void 0, function* () {
    if (files) {
        const { logo, banner } = files;
        if (logo === null || logo === void 0 ? void 0 : logo.length) {
            payload.logo = (yield (0, s3_1.uploadToS3)({
                file: logo[0],
                fileName: `images/shop/logo/${Math.floor(100000 + Math.random() * 900000)}`,
            }));
        }
        if (banner === null || banner === void 0 ? void 0 : banner.length) {
            payload.banner = (yield (0, s3_1.uploadToS3)({
                file: banner[0],
                fileName: `images/shop/banner/${Math.floor(100000 + Math.random() * 900000)}`,
            }));
        }
    }
    const result = yield shop_models_1.default.findOneAndUpdate({ author: userId }, payload, {
        new: true,
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to update Shop');
    }
    return result;
});
const deleteShop = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shop_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete shop');
    }
    return result;
});
exports.shopService = {
    createShop,
    getAllShop,
    getShopById,
    updateShop,
    deleteShop,
    updateMyShop,
    getMyShopById,
};
