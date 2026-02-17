export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  targetAllocation: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithStats extends Category {
  totalValue: number;
  currentAllocation: number;
  allocationDiff: number;
  assetCount: number;
}

export type AssetType = 'B3_STOCK' | 'B3_FII' | 'US_STOCK' | 'CRYPTO';

export interface Asset {
  id: number;
  categoryId: number;
  ticker: string;
  name: string | null;
  quantity: number;
  price: number;
  targetAllocation: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lastPriceUpdate?: string | null;
  priceSource?: string | null;
  assetType?: AssetType | null;
}

export interface AssetWithStats extends Asset {
  totalValue: number;
  currentAllocation: number;
  allocationDiff: number;
}

export interface Snapshot {
  id: number;
  date: string;
  totalValue: number;
  totalInvested: number;
  notes: string | null;
  createdAt: string;
}

export interface SnapshotWithEvolution extends Snapshot {
  evolutionPct: number;
  evolutionValue: number;
}

export interface DcaPlan {
  id: number;
  name: string;
  assetId: number | null;
  frequency: 'weekly' | 'monthly';
  amount: number;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DcaPlanWithProgress extends DcaPlan {
  totalEntries: number;
  completedEntries: number;
  assetTicker?: string;
}

export interface DcaEntry {
  id: number;
  planId: number;
  scheduledDate: string;
  amount: number;
  completed: boolean;
  completedAt: string | null;
  notes: string | null;
}

export interface Rule {
  id: number;
  title: string;
  content: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  totalPortfolioValue: number;
  categories: CategoryWithStats[];
  recentSnapshots: SnapshotWithEvolution[];
}

export interface PriceUpdateResult {
  success: boolean;
  ticker: string;
  oldPrice?: number;
  newPrice?: number;
  source?: string;
  error?: string;
}

export interface BulkPriceUpdateResult {
  total: number;
  successful: number;
  failed: number;
  results: PriceUpdateResult[];
}
