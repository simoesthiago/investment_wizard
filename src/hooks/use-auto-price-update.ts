'use client';

import { useEffect, useRef } from 'react';
import { updateAllAssetPrices } from '@/lib/actions/price-updates';

/**
 * Hook to automatically update asset prices on page load
 * Respects the configured update interval to avoid excessive API calls
 *
 * @param enabled - Whether auto-updates are enabled
 * @param lastGlobalUpdate - Timestamp of the most recent price update across all assets
 * @param intervalMinutes - Minimum minutes between updates
 */
export function useAutoPriceUpdate(
  enabled: boolean,
  lastGlobalUpdate: string | null,
  intervalMinutes: number
) {
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!enabled || hasRunRef.current) {
      return;
    }

    const shouldUpdate =
      !lastGlobalUpdate ||
      Date.now() - new Date(lastGlobalUpdate).getTime() > intervalMinutes * 60000;

    if (shouldUpdate) {
      hasRunRef.current = true;

      // Run update in background (don't await)
      updateAllAssetPrices().catch(error => {
        console.error('Auto price update failed:', error);
      });
    }
  }, [enabled, lastGlobalUpdate, intervalMinutes]);
}
