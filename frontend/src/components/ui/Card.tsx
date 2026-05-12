// src/components/ui/Card.tsx
import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface Props {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function Card({ title, subtitle, children, className = '', action }: Props) {
  return (
    <div className={cn(
      'rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5',
      className
    )}>
      {(title || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title    && <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
