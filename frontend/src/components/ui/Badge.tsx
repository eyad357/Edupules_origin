// src/components/ui/Badge.tsx
import { cn } from '../../lib/utils';

const VARIANTS: Record<string, string> = {
  normal:    'bg-green-100  text-green-800',
  low:       'bg-yellow-100 text-yellow-800',
  high:      'bg-orange-100 text-orange-800',
  critical:  'bg-red-100    text-red-800',
  info:      'bg-blue-100   text-blue-800',
  warning:   'bg-amber-100  text-amber-800',
  ban:       'bg-red-200    text-red-900',
  good:      'bg-green-100  text-green-800',
  active:    'bg-blue-100   text-blue-800',
  pending:   'bg-amber-100  text-amber-800',
  completed: 'bg-green-100  text-green-800',
  purple:    'bg-purple-100 text-purple-800',
};

interface Props {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}

export function Badge({ children, variant = 'normal', className = '' }: Props) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      VARIANTS[variant] ?? VARIANTS.normal,
      className,
    )}>
      {children}
    </span>
  );
}
