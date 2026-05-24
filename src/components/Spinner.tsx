import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

type SpinnerProps = {
  className?: string;
  label?: string;
};

export function Spinner({ className, label = 'Loading' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex items-center justify-center py-10', className)}
    >
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
