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
import { createSnapshot } from '@/lib/actions/snapshots';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';

export function SnapshotFormDialog() {
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  async function handleSubmit(formData: FormData) {
    const result = await createSnapshot(formData);
    if ('error' in result && result.error) {
      toast.error('Please check the form fields');
      return;
    }
    toast.success('Snapshot saved');
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Camera className="h-4 w-4 mr-1" />
          Take Snapshot
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Take Portfolio Snapshot</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" defaultValue={today} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalInvested">Total Amount Invested (cumulative)</Label>
            <Input
              id="totalInvested"
              name="totalInvested"
              type="number"
              step="0.01"
              min="0"
              required
            />
            <p className="text-xs text-muted-foreground">
              The total amount you have invested since the beginning (not just this month).
              Portfolio value will be calculated automatically from your current assets.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Snapshot</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
