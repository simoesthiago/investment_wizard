import { formatCurrency } from '@/lib/utils/currency';

interface CurrencyDisplayProps {
  value: number;
  currency?: string;
  className?: string;
}

export function CurrencyDisplay({ value, currency = 'BRL', className }: CurrencyDisplayProps) {
  return <span className={className}>{formatCurrency(value, currency)}</span>;
}
