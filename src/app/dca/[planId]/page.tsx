import { getDcaPlanById, getDcaEntries } from '@/lib/queries/dca-plans';
import { toggleDcaEntry } from '@/lib/actions/dca-plans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/currency';
import { DcaEntryToggle } from '@/components/dca/dca-entry-toggle';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ planId: string }>;
}

export default async function DcaPlanDetailPage({ params }: Props) {
  const { planId } = await params;
  const plan = getDcaPlanById(Number(planId));

  if (!plan) {
    notFound();
  }

  const entries = getDcaEntries(plan.id);
  const completedTotal = entries.filter(e => e.completed).reduce((sum, e) => sum + e.amount, 0);
  const totalPlanned = entries.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dca">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{plan.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="capitalize">{plan.frequency}</Badge>
            {plan.assetTicker && (
              <Badge variant="secondary" className="font-mono">{plan.assetTicker}</Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {formatCurrency(plan.amount)} per {plan.frequency === 'weekly' ? 'week' : 'month'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(completedTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {plan.completedEntries} of {plan.totalEntries} entries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPlanned - completedTotal)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Planned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPlanned)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Done</TableHead>
                <TableHead>#</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Completed At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, i) => (
                <TableRow key={entry.id} className={entry.completed ? 'opacity-60' : ''}>
                  <TableCell>
                    <DcaEntryToggle entryId={entry.id} completed={entry.completed} />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{i + 1}</TableCell>
                  <TableCell>{entry.scheduledDate}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCurrency(entry.amount)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {entry.completedAt ? new Date(entry.completedAt).toLocaleDateString() : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
