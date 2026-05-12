// src/components/ui/StatCard.tsx
// MODIFIED: Color map restricted to red / white / black palette.
//           "blue", "green", "orange", "purple" icon backgrounds are replaced
//           with shades of red, neutral, and near-black — keeping visual
//           differentiation while honouring the brand constraint.
//           Trend indicators: positive = red (attention) / negative = dark neutral.

import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  /**
   * Visual variant for the icon background.
   * All map to the red / neutral / black spectrum.
   * Legacy colour names are accepted for backwards-compat but remapped.
   */
  color?: 'red' | 'blue' | 'green' | 'orange' | 'purple';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'red',
  className,
}: StatCardProps) {
  // Remap all legacy colour names to the strict palette:
  //   red     → red brand
  //   blue    → dark neutral (near-black tint)
  //   green   → muted red (softer)
  //   orange  → red-700 (darker red)
  //   purple  → deep neutral
  const colorMap: Record<string, string> = {
    red:    'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400',
    blue:   'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
    green:  'bg-red-50/60 text-red-500 dark:bg-red-950/30 dark:text-red-300',
    orange: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
    purple: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200',
  };

  return (
    <div className={cn(
      'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 card-hover',
      className,
    )}>
      <div className="flex items-start justify-between">
        <div className={cn('p-2.5 rounded-lg', colorMap[color] ?? colorMap.red)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
            trend >= 0
              ? 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40'
              : 'text-neutral-600 bg-neutral-100 dark:text-neutral-400 dark:bg-neutral-800',
          )}>
            <span>{trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
            {trendLabel && <span className="opacity-70">{trendLabel}</span>}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{title}</p>
        {subtitle && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}