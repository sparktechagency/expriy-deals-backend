"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productValidation = void 0;
const zod_1 = require("zod");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const imageFileSchema = zod_1.z
    .instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, {
    message: 'Image size must be less than 5MB.',
})
    .refine(file => allowedMimeTypes.includes(file.type), {
    message: 'Only JPG, JPEG, PNG, and WEBP image formats are allowed.',
});
const createProductSchema = zod_1.z.object({
    // files: z.object({
    //   images: z
    //     .array(imageFileSchema)
    //     .min(1, { message: 'At least one image is required.' }),
    // }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, { message: 'Product name is required.' }),
        details: zod_1.z.string().min(1, { message: 'Product details are required.' }),
        category: zod_1.z.string().min(1, { message: 'Category is required.' }),
        price: zod_1.z.number().min(0, { message: 'Price must be a positive number.' }),
        quantity: zod_1.z.number().min(1, { message: 'Quantity is required.' }),
        expiredAt: zod_1.z
            .string()
            .optional(),
        discount: zod_1.z.number().optional(),
        discountPerDayIncise: zod_1.z.number().optional(),
    }),
});
const updateProductSchema = zod_1.z.object({
    // files: z
    //   .object({
    //     images: z.array(imageFileSchema).optional(),
    //   })
    //   .optional(),
    body: createProductSchema.shape.body.deepPartial(),
});
exports.productValidation = {
    createProductSchema,
    updateProductSchema,
};
