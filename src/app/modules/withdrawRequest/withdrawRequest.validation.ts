import { z } from 'zod';

const rejectRequestValidator = z.object({
  body: z.object({
    region: z.string({ required_error: 'region is required' }),
  }),
});

export const withdrawRequestValidation = {
  rejectRequestValidator,
};
