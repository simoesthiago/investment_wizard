import { getDb } from '@/lib/db';
import type { Category, CategoryWithStats } from '@/lib/types';

interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  target_allocation: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function mapRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    targetAllocation: row.target_allocation / 100,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getCategories(): Category[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM categories ORDER BY sort_order, name').all() as CategoryRow[];
  return rows.map(mapRow);
}

export function getCategoryById(id: number): Category | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as CategoryRow | undefined;
  return row ? mapRow(row) : null;
}

export function getCategoriesWithStats(): CategoryWithStats[] {
  const db = getDb();

  const rows = db.prepare(`
    SELECT
      c.*,
      COALESCE(SUM(a.quantity * a.price), 0) as total_value,
      COUNT(a.id) as asset_count
    FROM categories c
    LEFT JOIN assets a ON a.category_id = c.id
    GROUP BY c.id
    ORDER BY c.sort_order, c.name
  `).all() as (CategoryRow & { total_value: number; asset_count: number })[];

  const portfolioTotal = rows.reduce((sum, r) => sum + r.total_value, 0);

  return rows.map(row => {
    const cat = mapRow(row);
    const currentAllocation = portfolioTotal > 0 ? row.total_value / portfolioTotal : 0;
    return {
      ...cat,
      totalValue: row.total_value,
      currentAllocation,
      allocationDiff: currentAllocation - cat.targetAllocation,
      assetCount: row.asset_count,
    };
  });
}
