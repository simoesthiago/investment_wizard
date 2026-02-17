import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  icon: z.string().max(10).optional().nullable(),
  targetAllocation: z.coerce.number().min(0).max(100),
  sortOrder: z.coerce.number().int().optional().default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;
