"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawRequestValidation = void 0;
const zod_1 = require("zod");
const rejectRequestValidator = zod_1.z.object({
    body: zod_1.z.object({
        reason: zod_1.z.string({ required_error: 'Reason is required' }),
    }),
});
const approveRequestValidator = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string({ required_error: 'WithdrawRequest ID is required' }),
    }),
    body: zod_1.z.object({
        refNumber: zod_1.z.string({ required_error: 'Reference number is required' }),
    }),
});
exports.withdrawRequestValidation = {
    rejectRequestValidator,
    approveRequestValidator,
};
