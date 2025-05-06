import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

const imageFileSchema = z
  .instanceof(File)
  .refine(file => file.size <= MAX_FILE_SIZE, {
    message: 'Image size must be less than 5MB.',
  })
  .refine(file => allowedMimeTypes.includes(file.type), {
    message: 'Only JPG, JPEG, PNG, and WEBP image formats are allowed.',
  });

const createProductSchema = z.object({
  // files: z.object({
  //   images: z
  //     .array(imageFileSchema)
  //     .min(1, { message: 'At least one image is required.' }),
  // }),

  body: z.object({
    name: z.string().min(1, { message: 'Product name is required.' }),

    details: z.string().min(1, { message: 'Product details are required.' }),

    category: z.string().min(1, { message: 'Category is required.' }),

    price: z.number().min(0, { message: 'Price must be a positive number.' }),

    quantity: z.number().min(1, { message: 'Quantity is required.' }),

    expiredAt: z.string().min(1, { message: 'Expiry date is required.' }),

    discount: z.number().optional(),

    discountPerDayIncise: z.number().optional(),
  }),
});

const updateProductSchema = z.object({
  // files: z
  //   .object({
  //     images: z.array(imageFileSchema).optional(),
  //   })
  //   .optional(),
  body: createProductSchema.shape.body.deepPartial(),
});

export const productValidation = {
  createProductSchema,
  updateProductSchema,
};
