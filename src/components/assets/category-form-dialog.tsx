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
import { createCategory, updateCategory } from '@/lib/actions/categories';
import type { Category } from '@/lib/types';
import { toast } from 'sonner';
import { Plus, Pencil } from 'lucide-react';

interface CategoryFormDialogProps {
  category?: Category;
  trigger?: React.ReactNode;
}

export function CategoryFormDialog({ category, trigger }: CategoryFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditing = !!category;

  async function handleSubmit(formData: FormData) {
    const result = isEditing
      ? await updateCategory(category.id, formData)
      : await createCategory(formData);

    if ('error' in result && result.error) {
      toast.error('Please check the form fields');
      return;
    }

    toast.success(isEditing ? 'Category updated' : 'Category created');
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'New Category'}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={category?.name ?? ''} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon (emoji)</Label>
            <Input id="icon" name="icon" defaultValue={category?.icon ?? ''} placeholder="e.g. 📈" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetAllocation">Target Allocation (%)</Label>
            <Input
              id="targetAllocation"
              name="targetAllocation"
              type="number"
              step="0.1"
              min="0"
              max="100"
              defaultValue={category ? (category.targetAllocation * 100).toFixed(1) : ''}
              required
            />
          </div>
          <input type="hidden" name="sortOrder" value={category?.sortOrder ?? 0} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
