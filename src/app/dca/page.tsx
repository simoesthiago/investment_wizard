import { getDcaPlans } from '@/lib/queries/dca-plans';
import { deleteDcaPlan } from '@/lib/actions/dca-plans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeleteButton } from '@/components/shared/delete-button';
import { formatCurrency } from '@/lib/utils/currency';
import { DcaPlanFormDialog } from '@/components/dca/dca-plan-form-dialog';
import { Calendar } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import Link from 'next/link';

export default function DcaPage() {
  const plans = getDcaPlans();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">DCA Plans</h1>
          <p className="text-muted-foreground">
            Dollar Cost Averaging schedules for recurring purchases
          </p>
        </div>
        <DcaPlanFormDialog />
      </div>

      {plans.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title="No DCA plans yet"
          description="Create a recurring purchase plan to automate your investment strategy."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map(plan => {
            const progress = plan.totalEntries > 0
              ? (plan.completedEntries / plan.totalEntries * 100).toFixed(0)
              : '0';
            return (
              <Card key={plan.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">{plan.frequency}</Badge>
                      {plan.assetTicker && (
                        <Badge variant="secondary" className="text-xs font-mono">{plan.assetTicker}</Badge>
                      )}
                    </div>
                  </div>
                  <DeleteButton
                    onDelete={deleteDcaPlan.bind(null, plan.id)}
                    itemName="DCA Plan"
                  />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount per {plan.frequency === 'weekly' ? 'week' : 'month'}</span>
                      <span className="font-mono">{formatCurrency(plan.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-mono">{plan.completedEntries}/{plan.totalEntries} ({progress}%)</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Period</span>
                      <span className="text-xs">{plan.startDate} → {plan.endDate || '∞'}</span>
                    </div>
                    <Link href={`/dca/${plan.id}`}>
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        View Schedule
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
