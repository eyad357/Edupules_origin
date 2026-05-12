import { cn } from '../../lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  size = 'md', 
  color,
  showLabel = false,
  className 
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const getColor = () => {
    if (color) return color;
    if (percentage >= 75) return 'bg-red-500';
    if (percentage >= 50) return 'bg-orange-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden", sizeClasses[size])}>
        <div 
          className={cn("rounded-full transition-all duration-500", getColor(), sizeClasses[size])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{percentage.toFixed(1)}%</span>
      )}
    </div>
  );
}
