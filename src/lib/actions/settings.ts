'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';

export async function updateSetting(key: string, value: string | null) {
  const db = getDb();
  // Convert null/undefined to empty string to satisfy NOT NULL constraint
  const safeValue = value ?? '';

  db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, safeValue);

  revalidatePath('/');
  revalidatePath('/settings');
  return { success: true };
}
