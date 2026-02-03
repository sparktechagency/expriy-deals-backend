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
exports.userService = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_models_1 = require("./user.models");
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const user_constants_1 = require("./user.constants");
const shop_models_1 = __importDefault(require("../shop/shop.models"));
const mongoose_1 = require("mongoose");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const session = yield (0, mongoose_1.startSession)();
    session.startTransaction();
    try {
        const isExist = yield user_models_1.User.isUserExist(payload.email);
        if (isExist && !((_a = isExist === null || isExist === void 0 ? void 0 : isExist.verification) === null || _a === void 0 ? void 0 : _a.status)) {
            const { email, balance } = payload, updateData = __rest(payload, ["email", "balance"]);
            updateData.password = yield bcrypt_1.default.hash(payload === null || payload === void 0 ? void 0 : payload.password, Number(config_1.default.bcrypt_salt_rounds));
            const user = yield user_models_1.User.findByIdAndUpdate(isExist === null || isExist === void 0 ? void 0 : isExist._id, updateData, {
                new: true,
                session,
            });
            if (!user) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User update failed');
            }
            yield session.commitTransaction();
            session.endSession();
            return user;
        }
        else if (isExist && ((_b = isExist === null || isExist === void 0 ? void 0 : isExist.verification) === null || _b === void 0 ? void 0 : _b.status)) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User already exists with this email');
        }
        if (!payload.password) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Password is required');
        }
        if (payload.role === user_constants_1.USER_ROLE.vendor) {
            //@ts-ignore
            const { shopName, location } = payload, userData = __rest(payload, ["shopName", "location"]);
            if (!shopName || !location) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Shop name and location are required for vendor');
            }
            const user = yield user_models_1.User.create([userData], { session });
            if (!user || user.length === 0) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User creation failed');
            }
            const shop = yield shop_models_1.default.create([{ name: shopName, location, author: user[0]._id }], { session });
            if (!shop || shop.length === 0) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Shop creation failed');
            }
            const updatedUser = yield user_models_1.User.findByIdAndUpdate(user[0]._id, { shop: shop[0]._id }, { new: true, session });
            yield session.commitTransaction();
            session.endSession();
            return user[0];
        }
        const user = yield user_models_1.User.create([payload], { session });
        if (!user || user.length === 0) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User creation failed');
        }
        yield session.commitTransaction();
        session.endSession();
        return user[0];
    }
    catch (error) {
        console.error(error);
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
// const createUser = async (payload: IUser): Promise<IUser> => {
//   const isExist = await User.isUserExist(payload.email as string);
//   if (isExist && !isExist?.verification?.status) {
//     const { email, balance, ...updateData } = payload;
//     updateData.password = await bcrypt.hash(
//       payload?.password,
//       Number(config.bcrypt_salt_rounds),
//     );
//     const user = await User.findByIdAndUpdate(isExist?._id, updateData, {
//       new: true,
//     });
//     if (!user) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'user creation failed');
//     }
//     return user;
//   } else if (isExist && isExist?.verification?.status) {
//     throw new AppError(
//       httpStatus.FORBIDDEN,
//       'User already exists with this email',
//     );
//   }
//   if (!payload.password) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Password is required');
//   }
//   if (payload.role === USER_ROLE.vendor) {
//     const { shopName, location, ...userData } = payload;
//     if (!shopName || !location) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'Shop name and location are required for vendor',
//       );
//     }
//     const user = await User.create(userData);
//     if (!user) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed');
//     }
//     const shop = await Shop.create({
//       name: shopName,
//       location,
//       author: user._id,
//     });
//     if (!shop) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'Shop creation failed');
//     }
//     const updatedUser = await User.findByIdAndUpdate(
//       user?._id,
//       { shop: shop._id },
//       { new: true },
//     );
//     return updatedUser;
//   }
//   const user = await User.create(payload);
//   if (!user) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed');
//   }
//   return user;
// };
const getAllUser = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const userModel = new QueryBuilder_1.default(user_models_1.User.find(), query)
        .search(['name', 'email', 'phoneNumber', 'status'])
        .filter()
        .paginate()
        .sort();
    const data = yield userModel.modelQuery;
    const meta = yield userModel.countTotal();
    return {
        data,
        meta,
    };
});
const geUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_models_1.User.findById(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    return result;
});
const updateUser = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    delete payload.balance;
    const user = yield user_models_1.User.findByIdAndUpdate(id, payload, { new: true });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User updating failed');
    }
    return user;
});
const toggleUserStatusInDB = (userId, loggedInUserId) => __awaiter(void 0, void 0, void 0, function* () {
    if (userId === loggedInUserId)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Own status can't be changed");
    const isUserExist = yield user_models_1.User.findById(userId);
    if (!isUserExist)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    const res = yield user_models_1.User.findByIdAndUpdate(userId, {
        status: (isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.status) === 'active' ? 'blocked' : 'active',
    }, {
        new: true,
        runValidators: true,
    });
    return res;
});
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'user deleting failed');
    }
    return user;
});
exports.userService = {
    createUser,
    getAllUser,
    geUserById,
    updateUser,
    toggleUserStatusInDB,
    deleteUser,
};
