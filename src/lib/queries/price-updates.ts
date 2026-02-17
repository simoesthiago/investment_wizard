import { getDb } from '@/lib/db';
import { getSetting } from './settings';

export interface PriceUpdateStatus {
  needsUpdate: boolean;
  lastUpdate: string | null;
  minutesSinceUpdate: number | null;
  threshold: number;
}

/**
 * Get price update status for a specific asset
 */
export function getPriceUpdateStatus(assetId: number): PriceUpdateStatus {
  const db = getDb();
  const asset = db
    .prepare('SELECT last_price_update FROM assets WHERE id = ?')
    .get(assetId) as { last_price_update: string | null } | undefined;

  const threshold = parseInt(getSetting('price_update_interval') || '15');

  if (!asset || !asset.last_price_update) {
    return {
      needsUpdate: true,
      lastUpdate: null,
      minutesSinceUpdate: null,
      threshold,
    };
  }

  const lastUpdate = new Date(asset.last_price_update);
  const now = new Date();
  const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / 60000;

  return {
    needsUpdate: minutesSinceUpdate >= threshold,
    lastUpdate: asset.last_price_update,
    minutesSinceUpdate,
    threshold,
  };
}

/**
 * Get list of asset IDs that need price updates (stale prices)
 */
export function getStaleAssets(): number[] {
  const db = getDb();
  const threshold = parseInt(getSetting('price_update_interval') || '15');
  const thresholdDate = new Date(Date.now() - threshold * 60000).toISOString();

  const assets = db
    .prepare(
      `
      SELECT id FROM assets
      WHERE last_price_update IS NULL
         OR last_price_update < ?
    `
    )
    .all(thresholdDate) as { id: number }[];

  return assets.map(a => a.id);
}

/**
 * Get the most recent price update timestamp across all assets
 */
export function getLastGlobalPriceUpdate(): string | null {
  const db = getDb();
  const result = db
    .prepare(
      `
      SELECT last_price_update
      FROM assets
      WHERE last_price_update IS NOT NULL
      ORDER BY last_price_update DESC
      LIMIT 1
    `
    )
    .get() as { last_price_update: string } | undefined;

  return result?.last_price_update || null;
}
