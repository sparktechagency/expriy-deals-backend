"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const addToCardSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Products',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
}, {
    timestamps: true,
});
const AddToCard = (0, mongoose_1.model)('AddToCard', addToCardSchema);
exports.default = AddToCard;
