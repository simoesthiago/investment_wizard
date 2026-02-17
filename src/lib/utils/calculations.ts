import type { CategoryWithStats } from '@/lib/types';

export function calculateAssetValue(quantity: number, price: number): number {
  return quantity * price;
}

export function calculateAllocation(value: number, total: number): number {
  if (total === 0) return 0;
  return value / total;
}

export function calculateAllocationDiff(current: number, target: number): number {
  return current - target;
}

export function getCategoryDiffColor(diff: number): string {
  if (Math.abs(diff) < 0.005) return 'text-muted-foreground';
  return diff > 0 ? 'text-emerald-500' : 'text-red-500';
}

export function getTotalTargetAllocation(categories: CategoryWithStats[]): number {
  return categories.reduce((sum, cat) => sum + cat.targetAllocation, 0);
}
