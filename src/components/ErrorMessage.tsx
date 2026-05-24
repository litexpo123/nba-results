import { cn } from '@/lib/utils';

type ErrorMessageProps = {
  message?: string;
  className?: string;
};

export function ErrorMessage({
  message = "Couldn't load games",
  className,
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={cn('py-10 text-center text-sm text-destructive', className)}
    >
      {message}
    </div>
  );
}
