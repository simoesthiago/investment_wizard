import { getCategoriesWithStats } from '@/lib/queries/categories';
import { deleteCategory } from '@/lib/actions/categories';
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
import { CategoryFormDialog } from '@/components/assets/category-form-dialog';
import { DeleteButton } from '@/components/shared/delete-button';
import { formatCurrency } from '@/lib/utils/currency';
import { Pencil } from 'lucide-react';

export default function CategoriesPage() {
  const categories = getCategoriesWithStats();
  const totalTarget = categories.reduce((sum, c) => sum + c.targetAllocation, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your asset categories and target allocations
          </p>
        </div>
        <CategoryFormDialog />
      </div>

      {Math.abs(totalTarget - 1) > 0.001 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-3">
            <p className="text-sm text-amber-500">
              Target allocations sum to {(totalTarget * 100).toFixed(1)}%. They should add up to 100%.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Assets</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Target</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map(cat => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">
                    {cat.icon && <span className="mr-2">{cat.icon}</span>}
                    {cat.name}
                  </TableCell>
                  <TableCell className="text-right">{cat.assetCount}</TableCell>
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
                    <div className="flex justify-end gap-1">
                      <CategoryFormDialog
                        category={cat}
                        trigger={
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DeleteButton
                        onDelete={deleteCategory.bind(null, cat.id)}
                        itemName="Category"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No categories yet. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
