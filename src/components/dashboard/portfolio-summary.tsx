import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/currency';
import { Wallet } from 'lucide-react';

interface PortfolioSummaryProps {
  totalValue: number;
  categoryCount: number;
}

export function PortfolioSummary({ totalValue, categoryCount }: PortfolioSummaryProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Total Portfolio Value
        </CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{formatCurrency(totalValue)}</div>
        <p className="text-xs text-muted-foreground mt-1">
          Across {categoryCount} {categoryCount === 1 ? 'category' : 'categories'}
        </p>
      </CardContent>
    </Card>
  );
}
