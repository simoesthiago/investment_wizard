import { getDb } from '@/lib/db';
import type { Asset, AssetWithStats } from '@/lib/types';

interface AssetRow {
  id: number;
  category_id: number;
  ticker: string;
  name: string | null;
  quantity: number;
  price: number;
  target_allocation: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  last_price_update: string | null;
  price_source: string | null;
  asset_type: string | null;
}

function mapRow(row: AssetRow): Asset {
  return {
    id: row.id,
    categoryId: row.category_id,
    ticker: row.ticker,
    name: row.name,
    quantity: row.quantity,
    price: row.price,
    targetAllocation: row.target_allocation / 100,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastPriceUpdate: row.last_price_update,
    priceSource: row.price_source,
    assetType: row.asset_type as Asset['assetType'],
  };
}

export function getAssetsByCategory(categoryId: number): AssetWithStats[] {
  const db = getDb();
  const rows = db.prepare(
    'SELECT * FROM assets WHERE category_id = ? ORDER BY ticker'
  ).all(categoryId) as AssetRow[];

  const categoryTotal = rows.reduce((sum, r) => sum + r.quantity * r.price, 0);

  return rows.map(row => {
    const asset = mapRow(row);
    const totalValue = row.quantity * row.price;
    const currentAllocation = categoryTotal > 0 ? totalValue / categoryTotal : 0;
    return {
      ...asset,
      totalValue,
      currentAllocation,
      allocationDiff: currentAllocation - asset.targetAllocation,
    };
  });
}

export function getAssetById(id: number): Asset | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM assets WHERE id = ?').get(id) as AssetRow | undefined;
  return row ? mapRow(row) : null;
}

export function getAllAssets(): Asset[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM assets ORDER BY ticker').all() as AssetRow[];
  return rows.map(mapRow);
}
