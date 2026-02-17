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
import { createRule, updateRule } from '@/lib/actions/rules';
import type { Rule } from '@/lib/types';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface RuleFormDialogProps {
  rule?: Rule;
  trigger?: React.ReactNode;
}

export function RuleFormDialog({ rule, trigger }: RuleFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditing = !!rule;

  async function handleSubmit(formData: FormData) {
    const result = isEditing
      ? await updateRule(rule.id, formData)
      : await createRule(formData);

    if ('error' in result && result.error) {
      toast.error('Please check the form fields');
      return;
    }

    toast.success(isEditing ? 'Rule updated' : 'Rule added');
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Rule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Rule' : 'Add Rule'}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={rule?.title ?? ''} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={rule?.content ?? ''}
              rows={4}
              required
            />
          </div>
          <input type="hidden" name="sortOrder" value={rule?.sortOrder ?? 0} />
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
