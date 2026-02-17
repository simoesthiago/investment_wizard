import { getDb } from '@/lib/db';
import type { DcaPlanWithProgress, DcaEntry } from '@/lib/types';

interface PlanRow {
  id: number;
  name: string;
  asset_id: number | null;
  frequency: 'weekly' | 'monthly';
  amount: number;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  total_entries: number;
  completed_entries: number;
  asset_ticker: string | null;
}

export function getDcaPlans(): DcaPlanWithProgress[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT
      d.*,
      COUNT(e.id) as total_entries,
      SUM(CASE WHEN e.completed = 1 THEN 1 ELSE 0 END) as completed_entries,
      a.ticker as asset_ticker
    FROM dca_plans d
    LEFT JOIN dca_entries e ON e.plan_id = d.id
    LEFT JOIN assets a ON a.id = d.asset_id
    GROUP BY d.id
    ORDER BY d.created_at DESC
  `).all() as PlanRow[];

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    assetId: row.asset_id,
    frequency: row.frequency,
    amount: row.amount,
    startDate: row.start_date,
    endDate: row.end_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    totalEntries: row.total_entries,
    completedEntries: row.completed_entries,
    assetTicker: row.asset_ticker ?? undefined,
  }));
}

interface EntryRow {
  id: number;
  plan_id: number;
  scheduled_date: string;
  amount: number;
  completed: number;
  completed_at: string | null;
  notes: string | null;
}

export function getDcaEntries(planId: number): DcaEntry[] {
  const db = getDb();
  const rows = db.prepare(
    'SELECT * FROM dca_entries WHERE plan_id = ? ORDER BY scheduled_date'
  ).all(planId) as EntryRow[];

  return rows.map(row => ({
    id: row.id,
    planId: row.plan_id,
    scheduledDate: row.scheduled_date,
    amount: row.amount,
    completed: row.completed === 1,
    completedAt: row.completed_at,
    notes: row.notes,
  }));
}

export function getDcaPlanById(id: number): DcaPlanWithProgress | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT
      d.*,
      COUNT(e.id) as total_entries,
      SUM(CASE WHEN e.completed = 1 THEN 1 ELSE 0 END) as completed_entries,
      a.ticker as asset_ticker
    FROM dca_plans d
    LEFT JOIN dca_entries e ON e.plan_id = d.id
    LEFT JOIN assets a ON a.id = d.asset_id
    WHERE d.id = ?
    GROUP BY d.id
  `).get(id) as PlanRow | undefined;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    assetId: row.asset_id,
    frequency: row.frequency,
    amount: row.amount,
    startDate: row.start_date,
    endDate: row.end_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    totalEntries: row.total_entries,
    completedEntries: row.completed_entries,
    assetTicker: row.asset_ticker ?? undefined,
  };
}
