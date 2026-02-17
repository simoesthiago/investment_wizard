'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';
import type { SnapshotWithEvolution } from '@/lib/types';

interface EvolutionChartProps {
  snapshots: SnapshotWithEvolution[];
}

const chartConfig = {
  totalValue: {
    label: 'Portfolio Value',
    color: 'hsl(var(--chart-1))',
  },
  totalInvested: {
    label: 'Total Invested',
    color: 'hsl(var(--chart-2))',
  },
};

export function EvolutionChart({ snapshots }: EvolutionChartProps) {
  const data = [...snapshots].reverse().map(s => ({
    date: s.date,
    totalValue: s.totalValue,
    totalInvested: s.totalInvested,
  }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Portfolio Evolution</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
          No snapshots yet. Take snapshots to track portfolio evolution.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Portfolio Evolution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => formatCurrency(v).replace('R$', 'R$')}
              className="text-muted-foreground"
              width={80}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(value as number)}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="totalInvested"
              stackId="1"
              stroke="var(--color-totalInvested)"
              fill="var(--color-totalInvested)"
              fillOpacity={0.2}
            />
            <Area
              type="monotone"
              dataKey="totalValue"
              stackId="2"
              stroke="var(--color-totalValue)"
              fill="var(--color-totalValue)"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
