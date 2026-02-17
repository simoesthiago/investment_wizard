import { z } from 'zod';

export const assetSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  ticker: z.string().min(1, 'Ticker is required').max(20),
  name: z.string().max(100).optional().nullable(),
  quantity: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
  targetAllocation: z.coerce.number().min(0).max(100),
  notes: z.string().max(500).optional().nullable(),
});

export type AssetInput = z.infer<typeof assetSchema>;
