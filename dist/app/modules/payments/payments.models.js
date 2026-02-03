"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const paymentsSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    order: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Orders',
        required: true,
    },
    adminAmount: {
        type: Number,
    },
    vendorAmount: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending',
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'ongoing', 'picUp', 'shifted', 'delivered'],
        default: 'pending',
    },
    trnId: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    paymentIntentId: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
});
const Payments = (0, mongoose_1.model)('Payments', paymentsSchema);
exports.default = Payments;
