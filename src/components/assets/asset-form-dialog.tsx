'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createAsset, updateAsset } from '@/lib/actions/assets';
import type { Asset } from '@/lib/types';
import { toast } from 'sonner';
import { Plus, Pencil } from 'lucide-react';

interface AssetFormDialogProps {
  categoryId: number;
  asset?: Asset;
  trigger?: React.ReactNode;
}

export function AssetFormDialog({ categoryId, asset, trigger }: AssetFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditing = !!asset;

  async function handleSubmit(formData: FormData) {
    const result = isEditing
      ? await updateAsset(asset.id, formData)
      : await createAsset(formData);

    if ('error' in result && result.error) {
      toast.error('Please check the form fields');
      return;
    }

    toast.success(isEditing ? 'Asset updated' : 'Asset added');
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Asset
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Asset' : 'Add Asset'}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="categoryId" value={asset?.categoryId ?? categoryId} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ticker">Ticker / Symbol</Label>
              <Input id="ticker" name="ticker" defaultValue={asset?.ticker ?? ''} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input id="name" name="name" defaultValue={asset?.name ?? ''} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="any"
                min="0"
                defaultValue={asset?.quantity ?? ''}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (per unit)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={asset?.price ?? ''}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetAllocation">Target Allocation within Category (%)</Label>
            <Input
              id="targetAllocation"
              name="targetAllocation"
              type="number"
              step="0.1"
              min="0"
              max="100"
              defaultValue={asset ? (asset.targetAllocation * 100).toFixed(1) : ''}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" name="notes" defaultValue={asset?.notes ?? ''} rows={2} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? 'Save' : 'Add'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
