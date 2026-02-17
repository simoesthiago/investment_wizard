'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getCategoriesWithStats } from '@/lib/queries/categories';

export async function createSnapshot(formData: FormData) {
  const date = formData.get('date') as string;
  const totalInvested = parseFloat(formData.get('totalInvested') as string);
  const notes = (formData.get('notes') as string) || null;

  if (!date) return { error: { date: ['Date is required'] } };

  const db = getDb();
  const categories = getCategoriesWithStats();
  const totalValue = categories.reduce((sum, c) => sum + c.totalValue, 0);

  const result = db.prepare(`
    INSERT INTO snapshots (date, total_value, total_invested, notes)
    VALUES (?, ?, ?, ?)
  `).run(date, totalValue, totalInvested || 0, notes);

  const snapshotId = result.lastInsertRowid;

  const insertCat = db.prepare(`
    INSERT INTO snapshot_categories (snapshot_id, category_id, value, allocation_pct)
    VALUES (?, ?, ?, ?)
  `);

  for (const cat of categories) {
    insertCat.run(snapshotId, cat.id, cat.totalValue, cat.currentAllocation);
  }

  revalidatePath('/');
  revalidatePath('/snapshots');
  return { success: true };
}

export async function deleteSnapshot(id: number) {
  const db = getDb();
  db.prepare('DELETE FROM snapshots WHERE id = ?').run(id);
  revalidatePath('/');
  revalidatePath('/snapshots');
  return { success: true };
}
