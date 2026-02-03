"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const generateCryptoString_1 = __importDefault(require("../../utils/generateCryptoString"));
const orderSchema = new mongoose_1.Schema({
    id: {
        type: String,
        default: () => (0, generateCryptoString_1.default)(6),
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'author is required'],
    },
    items: [
        {
            product: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Products',
                required: [true, 'Product is required'],
            },
            price: {
                type: Number,
                required: [true, 'Price is required'],
            },
            discount: {
                type: Number,
                required: [true, 'discount is required'],
                min: 0,
            },
            quantity: {
                type: Number,
                required: [true, 'Quantity is required'],
                min: 1,
            },
        },
    ],
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: 1,
    },
    tnxId: {
        type: String,
        unique: true,
        default: () => (0, generateCryptoString_1.default)(10),
    },
    status: {
        type: String,
        enum: ['pending', 'ongoing', 'cancelled', 'delivered'],
        default: 'pending',
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    billingDetails: {
        address: {
            type: String,
            required: [true, 'Address is required'],
        },
        city: {
            type: String,
            required: [true, 'City is required'],
        },
        state: {
            type: String,
            required: [true, 'State is required'],
        },
        zipCode: {
            type: String,
            required: [true, 'Zip code is required'],
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
        },
    },
    isDeleted: { type: 'boolean', default: false },
}, {
    timestamps: true,
});
const Order = (0, mongoose_1.model)('Order', orderSchema);
exports.default = Order;
