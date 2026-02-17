'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { updateAllAssetPrices } from '@/lib/actions/price-updates';

export function PriceUpdateButton() {
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleUpdate() {
    setIsUpdating(true);

    try {
      const result = await updateAllAssetPrices();

      if (result.total === 0) {
        toast.info('No assets to update');
      } else if (result.failed > 0) {
        toast.warning(
          `Updated ${result.successful} of ${result.total} assets. ${result.failed} failed.`
        );
      } else {
        toast.success(`Successfully updated all ${result.successful} asset prices`);
      }
    } catch (error) {
      toast.error('Failed to update prices. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Button onClick={handleUpdate} disabled={isUpdating} variant="outline" size="sm">
      <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
      {isUpdating ? 'Updating...' : 'Update Prices'}
    </Button>
  );
}
