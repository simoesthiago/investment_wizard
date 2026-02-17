import { getDb } from '@/lib/db';
import type { Rule } from '@/lib/types';

interface RuleRow {
  id: number;
  title: string;
  content: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function getRules(): Rule[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM rules ORDER BY sort_order, id').all() as RuleRow[];
  return rows.map(row => ({
    id: row.id,
    title: row.title,
    content: row.content,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export function getRuleById(id: number): Rule | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM rules WHERE id = ?').get(id) as RuleRow | undefined;
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
