import { z } from 'zod';

const rejectRequestValidator = z.object({
  body: z.object({
    reason: z.string({ required_error: 'Reason is required' }),
  }),
});

export const withdrawRequestValidation = {
  rejectRequestValidator,
};
