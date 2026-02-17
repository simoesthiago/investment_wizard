'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface LastUpdateIndicatorProps {
  lastUpdate: string | null;
}

export function LastUpdateIndicator({ lastUpdate }: LastUpdateIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!lastUpdate) {
      setTimeAgo('Never');
      return;
    }

    function updateTimeAgo() {
      const last = new Date(lastUpdate);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - last.getTime()) / 60000);

      if (diffMinutes < 1) {
        setTimeAgo('Just now');
      } else if (diffMinutes < 60) {
        setTimeAgo(`${diffMinutes}m ago`);
      } else if (diffMinutes < 1440) {
        setTimeAgo(`${Math.floor(diffMinutes / 60)}h ago`);
      } else {
        setTimeAgo(`${Math.floor(diffMinutes / 1440)}d ago`);
      }
    }

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      <span>{timeAgo}</span>
    </div>
  );
}
