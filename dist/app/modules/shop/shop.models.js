"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const generateRandomHexColor_1 = __importDefault(require("../../utils/generateRandomHexColor"));
const shopSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: null,
    },
    address: {
        type: String,
        default: null,
    },
    openingHours: {
        type: String,
        default: null,
    },
    openingDays: {
        type: String,
        default: null,
    },
    logo: {
        type: String,
        default: null,
    },
    banner: {
        type: String,
        default: null,
    },
    document: {
        type: String,
        default: null,
    },
    bannerColor: {
        type: String,
        default: () => (0, generateRandomHexColor_1.default)(),
    },
    author: {
        type: mongoose_1.Types.ObjectId,
        default: null,
    },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: [{ type: Number, required: true }],
    },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
});
shopSchema.index({ location: '2dsphere' });
const Shop = (0, mongoose_1.model)('Shop', shopSchema);
exports.default = Shop;
