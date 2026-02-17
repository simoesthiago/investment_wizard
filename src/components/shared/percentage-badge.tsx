import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PercentageBadgeProps {
  value: number;
  showSign?: boolean;
  className?: string;
}

export function PercentageBadge({ value, showSign = true, className }: PercentageBadgeProps) {
  const isPositive = value > 0.005;
  const isNegative = value < -0.005;
  const isNeutral = !isPositive && !isNegative;

  const displayValue = showSign
    ? `${value > 0 ? '+' : ''}${(value * 100).toFixed(2)}%`
    : `${(value * 100).toFixed(2)}%`;

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-mono text-xs',
        isPositive && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
        isNegative && 'border-red-500/30 bg-red-500/10 text-red-500',
        isNeutral && 'border-muted-foreground/30 text-muted-foreground',
        className,
      )}
    >
      {displayValue}
    </Badge>
  );
}
