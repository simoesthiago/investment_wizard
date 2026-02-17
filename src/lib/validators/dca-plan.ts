import { z } from 'zod';

export const dcaPlanSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  assetId: z.coerce.number().int().positive().optional().nullable(),
  frequency: z.enum(['weekly', 'monthly']),
  amount: z.coerce.number().positive('Amount must be positive'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export type DcaPlanInput = z.infer<typeof dcaPlanSchema>;
