"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const vendorRequestSchema = new mongoose_1.Schema({
    name: {
        type: String,
        require: true,
    },
    shopName: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    document: {
        type: String,
        require: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'canceled'],
        default: 'pending',
    },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [
            {
                type: Number,
                require: true,
            },
        ],
    },
}, {
    timestamps: true,
});
const VendorRequest = (0, mongoose_1.model)('VendorRequest', vendorRequestSchema);
exports.default = VendorRequest;
