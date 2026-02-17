import { getRules } from '@/lib/queries/rules';
import { deleteRule } from '@/lib/actions/rules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeleteButton } from '@/components/shared/delete-button';
import { RuleFormDialog } from '@/components/shared/rule-form-dialog';
import { BookOpen, Pencil } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

export default function RulesPage() {
  const rules = getRules();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Investment Rules</h1>
          <p className="text-muted-foreground">
            Personal rules and reminders for your investment strategy
          </p>
        </div>
        <RuleFormDialog />
      </div>

      {rules.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-12 w-12" />}
          title="No rules yet"
          description="Add investment rules and reminders to keep your strategy on track."
        />
      ) : (
        <div className="space-y-4">
          {rules.map(rule => (
            <Card key={rule.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <CardTitle className="text-base">{rule.title}</CardTitle>
                <div className="flex gap-1">
                  <RuleFormDialog
                    rule={rule}
                    trigger={
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <DeleteButton
                    onDelete={deleteRule.bind(null, rule.id)}
                    itemName="Rule"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rule.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
