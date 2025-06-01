import { z } from 'zod';

const rejectRequestSchema = z.object({
  body: z.object({
    reason: z.string({ required_error: 'Reason is required' }),
  }),
});

export const vendorRequestValidator = {
  rejectRequestSchema,
};
