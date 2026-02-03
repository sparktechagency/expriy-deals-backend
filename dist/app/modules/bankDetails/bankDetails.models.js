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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bankDetailsSchema = new mongoose_1.Schema({
    vendor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    accountNumber: {
        type: String,
        required: [true, 'Account number is required'],
    },
    routingNumber: {
        type: String,
        required: [true, 'Routing number is required'],
    },
    bankName: {
        type: String,
        required: [true, 'Bank name is required'],
    },
    bankHolderName: {
        type: String,
        required: [true, 'Account holder name is required'],
    },
    bankAddress: {
        type: String,
        required: [true, 'Bank address is required'],
    },
}, {
    timestamps: true,
});
bankDetailsSchema.statics.findByVendorId = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield BankDetails.findOne({ vendor: userId });
    });
};
const BankDetails = (0, mongoose_1.model)('BankDetails', bankDetailsSchema);
exports.default = BankDetails;
