import { z } from 'zod';

const createOrderSchema = z.object({
  body: z.object({
    author: z.string().min(1, { message: 'Author ID is required' }),

    product: z.string().min(1, { message: 'Product ID is required' }),

    totalPrice: z
      .number()
      .min(0, { message: 'Total price must be a positive number' }),

    discount: z
      .number()
      .min(0, { message: 'Discount must be a positive number' })
      .max(100, { message: 'Discount must be less than or equal to 100' }),

    quantity: z.number().min(1, { message: 'Quantity must be at least 1' }),

    tnxId: z.string().min(1, { message: 'Transaction ID is required' }),

    status: z.enum(['pending', 'ongoing', 'cancelled', 'delivered'], {
      message: 'Invalid order status',
    }),

    isPaid: z.boolean(),

    billingDetails: z.object({
      address: z.string().min(1, { message: 'Address is required' }),
      city: z.string().min(1, { message: 'City is required' }),
      state: z.string().min(1, { message: 'State is required' }),
      zipCode: z.string().min(1, { message: 'Zip Code is required' }),
      country: z.string().min(1, { message: 'Country is required' }),
    }),

    isDeleted: z.boolean().default(false),
  }),
});

const updateOrderSchema = createOrderSchema.deepPartial(); // Allow partial updates

export const orderValidation = {
  createOrderSchema,
  updateOrderSchema,
};
