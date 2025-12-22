import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  dotClassName?: string;
}

export const LoadingSpinner = ({ className, dotClassName }: LoadingSpinnerProps) => {
  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <div className={cn("h-4 w-4 rounded-full bg-primary animate-pulse [animation-delay:-0.3s]", dotClassName)}></div>
      <div className={cn("h-4 w-4 rounded-full bg-primary animate-pulse [animation-delay:-0.15s]", dotClassName)}></div>
      <div className={cn("h-4 w-4 rounded-full bg-primary animate-pulse", dotClassName)}></div>
    </div>
  );
};
