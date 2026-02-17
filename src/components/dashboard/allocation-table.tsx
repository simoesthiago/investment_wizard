import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PercentageBadge } from '@/components/shared/percentage-badge';
import { formatCurrency } from '@/lib/utils/currency';
import type { CategoryWithStats } from '@/lib/types';

interface AllocationTableProps {
  categories: CategoryWithStats[];
  totalValue: number;
}

export function AllocationTable({ categories, totalValue }: AllocationTableProps) {
  const totalTarget = categories.reduce((sum, c) => sum + c.targetAllocation, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Allocation Breakdown</CardTitle>
        {Math.abs(totalTarget - 1) > 0.001 && (
          <p className="text-xs text-amber-500">
            Target allocations sum to {(totalTarget * 100).toFixed(1)}% (should be 100%)
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">Target</TableHead>
              <TableHead className="text-right">Diff</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map(cat => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">
                  {cat.icon && <span className="mr-2">{cat.icon}</span>}
                  {cat.name}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatCurrency(cat.totalValue)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {(cat.currentAllocation * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {(cat.targetAllocation * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  <PercentageBadge value={cat.allocationDiff} />
                </TableCell>
              </TableRow>
            ))}
            {categories.length > 0 && (
              <TableRow className="font-semibold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatCurrency(totalValue)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">100%</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {(totalTarget * 100).toFixed(1)}%
                </TableCell>
                <TableCell />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
