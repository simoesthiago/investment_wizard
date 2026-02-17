'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { toggleDcaEntry } from '@/lib/actions/dca-plans';

interface DcaEntryToggleProps {
  entryId: number;
  completed: boolean;
}

export function DcaEntryToggle({ entryId, completed }: DcaEntryToggleProps) {
  return (
    <Checkbox
      checked={completed}
      onCheckedChange={async () => {
        await toggleDcaEntry(entryId);
      }}
    />
  );
}
