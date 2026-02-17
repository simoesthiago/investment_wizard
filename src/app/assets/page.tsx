import { getCategoriesWithStats } from '@/lib/queries/categories';
import { getAssetsByCategory } from '@/lib/queries/assets';
import { deleteAsset } from '@/lib/actions/assets';
import { getStaleAssets } from '@/lib/queries/price-updates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AssetFormDialog } from '@/components/assets/asset-form-dialog';
import { DeleteButton } from '@/components/shared/delete-button';
import { PercentageBadge } from '@/components/shared/percentage-badge';
import { PriceUpdateButton } from '@/components/assets/price-update-button';
import { LastUpdateIndicator } from '@/components/assets/last-update-indicator';
import { formatCurrency } from '@/lib/utils/currency';
import { Pencil, FolderKanban } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/shared/empty-state';

export default function AssetsPage() {
  const categories = getCategoriesWithStats();
  const staleCount = getStaleAssets().length;

  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground">Manage your investment holdings</p>
        </div>
        <EmptyState
          icon={<FolderKanban className="h-12 w-12" />}
          title="No categories yet"
          description="Create asset categories first, then add your holdings."
          action={
            <Link href="/categories">
              <Button>Go to Categories</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground">
            Manage your investment holdings
            {staleCount > 0 && ` • ${staleCount} asset${staleCount > 1 ? 's' : ''} need price updates`}
          </p>
        </div>
        <PriceUpdateButton />
      </div>

      {categories.map(category => {
        const assets = getAssetsByCategory(category.id);
        return (
          <Card key={category.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {category.icon && <span className="mr-2">{category.icon}</span>}
                  {category.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(category.totalValue)} &middot; {(category.currentAllocation * 100).toFixed(1)}% of portfolio
                </p>
              </div>
              <AssetFormDialog categoryId={category.id} />
            </CardHeader>
            <CardContent>
              {assets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No assets in this category yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticker</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">Current</TableHead>
                      <TableHead className="text-right">Target</TableHead>
                      <TableHead className="text-right">Diff</TableHead>
                      <TableHead>Last Update</TableHead>
                      <TableHead className="w-[80px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map(asset => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium font-mono">{asset.ticker}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{asset.name || '-'}</TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {asset.quantity.toLocaleString('en-US', { maximumFractionDigits: 6 })}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatCurrency(asset.price)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatCurrency(asset.totalValue)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {(asset.currentAllocation * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {(asset.targetAllocation * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">
                          <PercentageBadge value={asset.allocationDiff} />
                        </TableCell>
                        <TableCell>
                          <LastUpdateIndicator lastUpdate={asset.lastPriceUpdate || null} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <AssetFormDialog
                              categoryId={category.id}
                              asset={asset}
                              trigger={
                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <DeleteButton
                              onDelete={deleteAsset.bind(null, asset.id)}
                              itemName="Asset"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
