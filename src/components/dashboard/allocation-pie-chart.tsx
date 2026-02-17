'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Sector } from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';
import type { CategoryWithStats } from '@/lib/types';

// Distinct, vibrant colors mapped to specific categories
const CATEGORY_COLORS: Record<string, string> = {
  'Stocks': 'hsl(262 83% 58%)',      // Purple
  'Ações BR': 'hsl(142 76% 36%)',    // Green
  'FIIs': 'hsl(221 83% 53%)',        // Blue
  'Renda Fixa': 'hsl(48 96% 53%)',   // Yellow
  'Caixa': 'hsl(48 96% 53%)',        // Yellow
  'Cripto': 'hsl(280 87% 65%)',      // Pink/Purple
};

// Fallback colors for unknown categories
const FALLBACK_COLORS = [
  'hsl(24 95% 53%)',   // Orange
  'hsl(199 89% 48%)',  // Cyan
  'hsl(0 84% 60%)',    // Red
];

function getCategoryColor(categoryName: string, index: number): string {
  return CATEGORY_COLORS[categoryName] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

// Active shape component for hover effect
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

interface AllocationPieChartProps {
  categories: CategoryWithStats[];
}

export function AllocationPieChart({ categories }: AllocationPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const data = categories
    .filter(c => c.totalValue > 0)
    .map((cat, i) => ({
      name: cat.name,
      value: cat.totalValue,
      allocation: cat.currentAllocation,
      fill: getCategoryColor(cat.name, i),
    }));

  const chartConfig = Object.fromEntries(
    data.map((d, i) => [
      d.name,
      { label: d.name, color: getCategoryColor(d.name, i) },
    ])
  );

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Portfolio Allocation</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
          No assets yet. Add categories and assets to see the chart.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Portfolio Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0];
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-md">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold">{data.name}</span>
                      <span className="text-sm font-bold">{formatCurrency(data.value as number)}</span>
                      <span className="text-xs text-muted-foreground">
                        {((data.payload.allocation || 0) * 100).toFixed(1)}% do portfólio
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center gap-1.5 text-xs">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: getCategoryColor(item.name, i) }}
              />
              <span className="text-muted-foreground">{item.name}</span>
              <span className="font-mono font-medium">
                {(item.allocation * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
