'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { ruleSchema } from '@/lib/validators/rule';

export async function createRule(formData: FormData) {
  const raw = {
    title: formData.get('title'),
    content: formData.get('content'),
    sortOrder: formData.get('sortOrder') || 0,
  };

  const parsed = ruleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const db = getDb();
  db.prepare(`
    INSERT INTO rules (title, content, sort_order)
    VALUES (?, ?, ?)
  `).run(parsed.data.title, parsed.data.content, parsed.data.sortOrder ?? 0);

  revalidatePath('/rules');
  return { success: true };
}

export async function updateRule(id: number, formData: FormData) {
  const raw = {
    title: formData.get('title'),
    content: formData.get('content'),
    sortOrder: formData.get('sortOrder') || 0,
  };

  const parsed = ruleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const db = getDb();
  db.prepare(`
    UPDATE rules SET title = ?, content = ?, sort_order = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(parsed.data.title, parsed.data.content, parsed.data.sortOrder ?? 0, id);

  revalidatePath('/rules');
  return { success: true };
}

export async function deleteRule(id: number) {
  const db = getDb();
  db.prepare('DELETE FROM rules WHERE id = ?').run(id);
  revalidatePath('/rules');
  return { success: true };
}
