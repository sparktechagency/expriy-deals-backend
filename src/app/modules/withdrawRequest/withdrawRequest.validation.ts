import { z } from 'zod';

const rejectRequestValidator = z.object({
  body: z.object({
    reason: z.string({ required_error: 'Reason is required' }),
  }),
});

const approveRequestValidator = z.object({
  params: z.object({
    id: z.string({ required_error: 'WithdrawRequest ID is required' }),
  }),
  body: z.object({
    refNumber: z.string({ required_error: 'Reference number is required' }),
  }),
});
export const withdrawRequestValidation = {
  rejectRequestValidator,
  approveRequestValidator,
};
