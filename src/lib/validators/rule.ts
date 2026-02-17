import { z } from 'zod';

export const ruleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required').max(2000),
  sortOrder: z.coerce.number().int().optional().default(0),
});

export type RuleInput = z.infer<typeof ruleSchema>;
