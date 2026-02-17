'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { assetSchema } from '@/lib/validators/asset';

export async function createAsset(formData: FormData) {
  const raw = {
    categoryId: formData.get('categoryId'),
    ticker: formData.get('ticker'),
    name: formData.get('name') || null,
    quantity: formData.get('quantity'),
    price: formData.get('price'),
    targetAllocation: formData.get('targetAllocation'),
    notes: formData.get('notes') || null,
  };

  const parsed = assetSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const db = getDb();
  db.prepare(`
    INSERT INTO assets (category_id, ticker, name, quantity, price, target_allocation, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    parsed.data.categoryId,
    parsed.data.ticker.toUpperCase(),
    parsed.data.name,
    parsed.data.quantity,
    parsed.data.price,
    parsed.data.targetAllocation,
    parsed.data.notes,
  );

  revalidatePath('/');
  revalidatePath('/assets');
  return { success: true };
}

export async function updateAsset(id: number, formData: FormData) {
  const raw = {
    categoryId: formData.get('categoryId'),
    ticker: formData.get('ticker'),
    name: formData.get('name') || null,
    quantity: formData.get('quantity'),
    price: formData.get('price'),
    targetAllocation: formData.get('targetAllocation'),
    notes: formData.get('notes') || null,
  };

  const parsed = assetSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const db = getDb();
  db.prepare(`
    UPDATE assets SET category_id = ?, ticker = ?, name = ?, quantity = ?, price = ?,
    target_allocation = ?, notes = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    parsed.data.categoryId,
    parsed.data.ticker.toUpperCase(),
    parsed.data.name,
    parsed.data.quantity,
    parsed.data.price,
    parsed.data.targetAllocation,
    parsed.data.notes,
    id,
  );

  revalidatePath('/');
  revalidatePath('/assets');
  return { success: true };
}

export async function deleteAsset(id: number) {
  const db = getDb();
  db.prepare('DELETE FROM assets WHERE id = ?').run(id);
  revalidatePath('/');
  revalidatePath('/assets');
  return { success: true };
}
