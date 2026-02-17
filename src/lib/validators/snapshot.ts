import { z } from 'zod';

export const snapshotSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  totalInvested: z.coerce.number().min(0),
  notes: z.string().max(500).optional().nullable(),
});

export type SnapshotInput = z.infer<typeof snapshotSchema>;
