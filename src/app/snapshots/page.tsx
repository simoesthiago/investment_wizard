import { getSnapshots } from '@/lib/queries/snapshots';
import { deleteSnapshot, createSnapshot } from '@/lib/actions/snapshots';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DeleteButton } from '@/components/shared/delete-button';
import { PercentageBadge } from '@/components/shared/percentage-badge';
import { formatCurrency } from '@/lib/utils/currency';
import { SnapshotFormDialog } from '@/components/dashboard/snapshot-form-dialog';
import { TrendingUp } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

export default function SnapshotsPage() {
  const snapshots = getSnapshots();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Snapshots</h1>
          <p className="text-muted-foreground">
            Track your portfolio value over time
          </p>
        </div>
        <SnapshotFormDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Portfolio History</CardTitle>
        </CardHeader>
        <CardContent>
          {snapshots.length === 0 ? (
            <EmptyState
              icon={<TrendingUp className="h-12 w-12" />}
              title="No snapshots yet"
              description="Take a snapshot to record your current portfolio state."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Portfolio Value</TableHead>
                  <TableHead className="text-right">Total Invested</TableHead>
                  <TableHead className="text-right">Return (R$)</TableHead>
                  <TableHead className="text-right">Return (%)</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshots.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.date}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(s.totalValue)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(s.totalInvested)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      <span className={s.evolutionValue >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                        {formatCurrency(s.evolutionValue)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <PercentageBadge value={s.evolutionPct} />
                    </TableCell>
                    <TableCell>
                      <DeleteButton
                        onDelete={deleteSnapshot.bind(null, s.id)}
                        itemName="Snapshot"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
