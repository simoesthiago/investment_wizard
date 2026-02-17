import { getDb } from '@/lib/db';
import type { SnapshotWithEvolution } from '@/lib/types';

interface SnapshotRow {
  id: number;
  date: string;
  total_value: number;
  total_invested: number;
  notes: string | null;
  created_at: string;
}

export function getSnapshots(limit: number = 50): SnapshotWithEvolution[] {
  const db = getDb();
  const rows = db.prepare(
    'SELECT * FROM snapshots ORDER BY date DESC LIMIT ?'
  ).all(limit) as SnapshotRow[];

  return rows.map(row => ({
    id: row.id,
    date: row.date,
    totalValue: row.total_value,
    totalInvested: row.total_invested,
    notes: row.notes,
    createdAt: row.created_at,
    evolutionPct: row.total_invested > 0 ? (row.total_value - row.total_invested) / row.total_invested : 0,
    evolutionValue: row.total_value - row.total_invested,
  }));
}

export function getSnapshotById(id: number): SnapshotWithEvolution | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM snapshots WHERE id = ?').get(id) as SnapshotRow | undefined;
  if (!row) return null;
  return {
    id: row.id,
    date: row.date,
    totalValue: row.total_value,
    totalInvested: row.total_invested,
    notes: row.notes,
    createdAt: row.created_at,
    evolutionPct: row.total_invested > 0 ? (row.total_value - row.total_invested) / row.total_invested : 0,
    evolutionValue: row.total_value - row.total_invested,
  };
}
