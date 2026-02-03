"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderValidation = void 0;
const zod_1 = require("zod");
const createOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        author: zod_1.z.string().min(1, { message: 'Author ID is required' }),
        product: zod_1.z.string().min(1, { message: 'Product ID is required' }),
        totalPrice: zod_1.z
            .number()
            .min(0, { message: 'Total price must be a positive number' }),
        discount: zod_1.z
            .number()
            .min(0, { message: 'Discount must be a positive number' })
            .max(100, { message: 'Discount must be less than or equal to 100' }),
        quantity: zod_1.z.number().min(1, { message: 'Quantity must be at least 1' }),
        tnxId: zod_1.z.string().min(1, { message: 'Transaction ID is required' }),
        status: zod_1.z.enum(['pending', 'ongoing', 'cancelled', 'delivered'], {
            message: 'Invalid order status',
        }),
        isPaid: zod_1.z.boolean(),
        billingDetails: zod_1.z.object({
            address: zod_1.z.string().min(1, { message: 'Address is required' }),
            city: zod_1.z.string().min(1, { message: 'City is required' }),
            state: zod_1.z.string().min(1, { message: 'State is required' }),
            zipCode: zod_1.z.string().min(1, { message: 'Zip Code is required' }),
            country: zod_1.z.string().min(1, { message: 'Country is required' }),
        }),
        isDeleted: zod_1.z.boolean().default(false),
    }),
});
const updateOrderSchema = createOrderSchema.deepPartial(); // Allow partial updates
exports.orderValidation = {
    createOrderSchema,
    updateOrderSchema,
};
