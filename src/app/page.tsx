import { getDashboardData } from '@/lib/queries/dashboard';
import { getLastGlobalPriceUpdate } from '@/lib/queries/price-updates';
import { getSetting } from '@/lib/queries/settings';
import { PortfolioSummary } from '@/components/dashboard/portfolio-summary';
import { AllocationTable } from '@/components/dashboard/allocation-table';
import { AllocationPieChart } from '@/components/dashboard/allocation-pie-chart';
import { EvolutionChart } from '@/components/dashboard/evolution-chart';
import { AutoUpdateWrapper } from '@/components/dashboard/auto-update-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

export default function DashboardPage() {
  const data = getDashboardData();
  const latestSnapshot = data.recentSnapshots[0];

  // Auto-update configuration
  const autoUpdateEnabled = getSetting('auto_update_enabled') === 'true';
  const updateInterval = parseInt(getSetting('price_update_interval') || '15');
  const lastGlobalUpdate = getLastGlobalPriceUpdate();

  return (
    <AutoUpdateWrapper
      enabled={autoUpdateEnabled}
      lastGlobalUpdate={lastGlobalUpdate}
      intervalMinutes={updateInterval}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your investment portfolio</p>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <PortfolioSummary
          totalValue={data.totalPortfolioValue}
          categoryCount={data.categories.length}
        />

        {latestSnapshot && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Invested
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(latestSnapshot.totalInvested)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last snapshot: {latestSnapshot.date}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Evolution
                </CardTitle>
                {latestSnapshot.evolutionValue >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${latestSnapshot.evolutionValue >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {formatCurrency(latestSnapshot.evolutionValue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(latestSnapshot.evolutionPct * 100).toFixed(2)}% return
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Snapshots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.recentSnapshots.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Historical records</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AllocationTable categories={data.categories} totalValue={data.totalPortfolioValue} />
        <AllocationPieChart categories={data.categories} />
      </div>

        <EvolutionChart snapshots={data.recentSnapshots} />
      </div>
    </AutoUpdateWrapper>
  );
}
