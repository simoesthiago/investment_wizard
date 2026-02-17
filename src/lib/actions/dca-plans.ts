'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { dcaPlanSchema } from '@/lib/validators/dca-plan';

function generateEntries(startDate: string, endDate: string | null, frequency: 'weekly' | 'monthly', amount: number) {
  const entries: { date: string; amount: number }[] = [];
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  const current = new Date(start);

  const maxEntries = 200;
  let count = 0;

  while (count < maxEntries) {
    if (end && current > end) break;
    if (!end && count >= 52) break; // Default 52 entries if no end date

    entries.push({
      date: current.toISOString().split('T')[0],
      amount,
    });

    if (frequency === 'weekly') {
      current.setDate(current.getDate() + 7);
    } else {
      current.setMonth(current.getMonth() + 1);
    }
    count++;
  }

  return entries;
}

export async function createDcaPlan(formData: FormData) {
  const raw = {
    name: formData.get('name'),
    assetId: formData.get('assetId') || null,
    frequency: formData.get('frequency'),
    amount: formData.get('amount'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate') || null,
    notes: formData.get('notes') || null,
  };

  const parsed = dcaPlanSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const db = getDb();

  const result = db.prepare(`
    INSERT INTO dca_plans (name, asset_id, frequency, amount, start_date, end_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    parsed.data.name,
    parsed.data.assetId ?? null,
    parsed.data.frequency,
    parsed.data.amount,
    parsed.data.startDate,
    parsed.data.endDate ?? null,
    parsed.data.notes ?? null,
  );

  const planId = result.lastInsertRowid;
  const entries = generateEntries(parsed.data.startDate, parsed.data.endDate ?? null, parsed.data.frequency, parsed.data.amount);

  const insertEntry = db.prepare(`
    INSERT INTO dca_entries (plan_id, scheduled_date, amount)
    VALUES (?, ?, ?)
  `);

  const insertMany = db.transaction((items: typeof entries) => {
    for (const entry of items) {
      insertEntry.run(planId, entry.date, entry.amount);
    }
  });

  insertMany(entries);

  revalidatePath('/dca');
  return { success: true, planId: Number(planId) };
}

export async function toggleDcaEntry(entryId: number) {
  const db = getDb();
  const entry = db.prepare('SELECT completed FROM dca_entries WHERE id = ?').get(entryId) as { completed: number } | undefined;
  if (!entry) return { error: 'Entry not found' };

  const newCompleted = entry.completed === 1 ? 0 : 1;
  const completedAt = newCompleted === 1 ? new Date().toISOString() : null;

  db.prepare('UPDATE dca_entries SET completed = ?, completed_at = ? WHERE id = ?')
    .run(newCompleted, completedAt, entryId);

  revalidatePath('/dca');
  return { success: true };
}

export async function deleteDcaPlan(id: number) {
  const db = getDb();
  db.prepare('DELETE FROM dca_plans WHERE id = ?').run(id);
  revalidatePath('/dca');
  return { success: true };
}
