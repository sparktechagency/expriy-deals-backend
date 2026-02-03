"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorRequestValidator = void 0;
const zod_1 = require("zod");
const rejectRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        reason: zod_1.z.string({ required_error: 'Reason is required' }),
    }),
});
exports.vendorRequestValidator = {
    rejectRequestSchema,
};
