'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getSetting } from '@/lib/queries/settings';
import { getAllAssets, getAssetById } from '@/lib/queries/assets';
import { detectAssetType } from '@/lib/services/asset-type-detector';
import { fetchPrice } from '@/lib/services/price-api';
import type { PriceUpdateResult, BulkPriceUpdateResult } from '@/lib/types';

/**
 * Update the price of a single asset by fetching from the appropriate API
 */
export async function updateAssetPrice(assetId: number): Promise<PriceUpdateResult> {
  const asset = getAssetById(assetId);

  if (!asset) {
    return {
      success: false,
      ticker: 'unknown',
      error: 'Asset not found',
    };
  }

  const db = getDb();

  // Detect asset type if not already set
  let assetType = asset.assetType;
  if (!assetType) {
    assetType = detectAssetType(asset.ticker);
    db.prepare('UPDATE assets SET asset_type = ? WHERE id = ?').run(assetType, assetId);
  }

  // Fetch price from appropriate API
  const apiKey = getSetting('alpha_vantage_api_key') || '';
  const result = await fetchPrice(asset.ticker, assetType, apiKey);

  if ('error' in result) {
    return {
      success: false,
      ticker: asset.ticker,
      error: result.error,
    };
  }

  // Update price in database
  const oldPrice = asset.price;
  db.prepare(
    `
    UPDATE assets
    SET price = ?,
        last_price_update = ?,
        price_source = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `
  ).run(result.price, result.timestamp, result.source, assetId);

  revalidatePath('/');
  revalidatePath('/assets');

  return {
    success: true,
    ticker: asset.ticker,
    oldPrice,
    newPrice: result.price,
    source: result.source,
  };
}

/**
 * Update prices for all assets in the portfolio
 * Processes sequentially with delays to respect rate limits
 */
export async function updateAllAssetPrices(): Promise<BulkPriceUpdateResult> {
  const assets = getAllAssets();
  const results: PriceUpdateResult[] = [];

  for (const asset of assets) {
    const result = await updateAssetPrice(asset.id);
    results.push(result);

    // Small delay between requests for extra safety
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  revalidatePath('/');
  revalidatePath('/assets');

  return {
    total: assets.length,
    successful,
    failed,
    results,
  };
}
