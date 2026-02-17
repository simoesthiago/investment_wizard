import { getCategoriesWithStats } from './categories';
import { getSnapshots } from './snapshots';
import type { DashboardData } from '@/lib/types';

export function getDashboardData(): DashboardData {
  const categories = getCategoriesWithStats();
  const totalPortfolioValue = categories.reduce((sum, c) => sum + c.totalValue, 0);
  const recentSnapshots = getSnapshots(10);

  return {
    totalPortfolioValue,
    categories,
    recentSnapshots,
  };
}
