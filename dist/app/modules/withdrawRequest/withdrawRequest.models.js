"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const withdrawRequestSchema = new mongoose_1.Schema({
    vendor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    reason: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    bankDetails: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'BankDetails',
        required: true,
    },
}, {
    timestamps: true,
});
const WithdrawRequest = (0, mongoose_1.model)('WithdrawRequest', withdrawRequestSchema);
exports.default = WithdrawRequest;
