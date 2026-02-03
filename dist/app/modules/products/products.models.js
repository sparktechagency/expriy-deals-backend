"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const imageSchema = new mongoose_1.Schema({
    key: { type: String, required: [true, 'Image key is required'] },
    url: {
        type: String,
        required: [true, 'Image URL is required'],
        match: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
    }, // URL validation
});
const productsSchema = new mongoose_1.Schema({
    images: [imageSchema],
    author: {
        type: String,
        ref: 'User',
        required: [true, 'Product author is required'],
    },
    name: {
        type: String,
        required: [true, 'Product name is required'],
    },
    details: { type: String, required: [true, 'Product details are required'] },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Categories',
        required: true,
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0,
    },
    totalSell: {
        type: Number,
        default: 0,
    },
    stock: {
        type: Number,
        required: [true, 'stock is required'],
    },
    expiredAt: {
        type: String,
        default: null,
    },
    discount: {
        type: Number,
        default: 0,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const Products = (0, mongoose_1.model)('Products', productsSchema);
exports.default = Products;
