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
exports.User = void 0;
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("../../config"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_constants_1 = require("./user.constants");
const userSchema = new mongoose_1.Schema({
    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active',
    },
    name: {
        type: String,
        required: true,
        default: null,
    },
    shop: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Shop',
        default: null,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
        required: false,
        default: null,
    },
    password: {
        type: String,
        required: false,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Others'],
        default: null,
    },
    dateOfBirth: {
        type: String,
        default: null,
    },
    loginWth: {
        type: String,
        enum: user_constants_1.Login_With,
        default: user_constants_1.Login_With.credentials,
    },
    expireAt: {
        type: Date,
        default: () => {
            const expireAt = new Date();
            // return expireAt.setHours(expireAt.getHours() + 48);
            return expireAt.setMinutes(expireAt.getMinutes() + 20);
        },
    },
    profile: {
        type: String,
        default: null,
    },
    document: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: user_constants_1.Role,
        default: user_constants_1.USER_ROLE.user,
    },
    address: {
        type: String,
        default: null,
    },
    city: {
        type: String,
        default: null,
    },
    state: {
        type: String,
        default: null,
    },
    country: {
        type: String,
        default: null,
    },
    zipCode: {
        type: String,
        default: null,
    },
    needsPasswordChange: {
        type: Boolean,
    },
    passwordChangedAt: {
        type: Date,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    verification: {
        otp: {
            type: mongoose_1.Schema.Types.Mixed,
            default: 0,
        },
        expiresAt: {
            type: Date,
        },
        status: {
            type: Boolean,
            default: false,
        },
    },
    stripeAccountId: {
        type: String,
    },
    customer: {
        type: String,
    },
    balance: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const user = this;
        if (user.loginWth === user_constants_1.Login_With.credentials) {
            user.password = yield bcrypt_1.default.hash(user.password, Number(config_1.default.bcrypt_salt_rounds));
        }
        next();
    });
});
// set '' after saving password
userSchema.post('save', 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function (error, doc, next) {
    doc.password = '';
    next();
});
userSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
userSchema.statics.isUserExist = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield exports.User.findOne({ email: email }).select('+password');
    });
};
userSchema.statics.IsUserExistId = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield exports.User.findById(id).select('+password');
    });
};
userSchema.statics.isPasswordMatched = function (plainTextPassword, hashedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(plainTextPassword, hashedPassword);
    });
};
exports.User = (0, mongoose_1.model)('User', userSchema);
