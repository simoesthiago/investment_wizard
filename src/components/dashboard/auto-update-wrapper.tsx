'use client';

import { useAutoPriceUpdate } from '@/hooks/use-auto-price-update';
import type { ReactNode } from 'react';

interface AutoUpdateWrapperProps {
  enabled: boolean;
  lastGlobalUpdate: string | null;
  intervalMinutes: number;
  children: ReactNode;
}

/**
 * Client wrapper component that triggers automatic price updates
 * when the dashboard page loads, respecting the configured interval
 */
export function AutoUpdateWrapper({
  enabled,
  lastGlobalUpdate,
  intervalMinutes,
  children,
}: AutoUpdateWrapperProps) {
  useAutoPriceUpdate(enabled, lastGlobalUpdate, intervalMinutes);

  return <>{children}</>;
}
