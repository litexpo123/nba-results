import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-6 w-6',
  md: 'h-10 w-10',
  lg: 'h-20 w-20',
};

type TeamLogoProps = {
  src: string | null;
  abbreviation: string;
  size?: Size;
  className?: string;
};

export function TeamLogo({ src, abbreviation, size = 'md', className }: TeamLogoProps) {
  if (!src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground',
          SIZE_CLASSES[size],
          className,
        )}
      >
        {abbreviation}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={`${abbreviation} logo`}
      className={cn('object-contain', SIZE_CLASSES[size], className)}
    />
  );
}
