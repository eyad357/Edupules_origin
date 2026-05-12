// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const VARIANTS = {
  primary:   'bg-red-600 hover:bg-red-700 text-white',
  secondary: 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700',
  ghost:     'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
  danger:    'bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-700 dark:text-red-400',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 font-semibold rounded-lg transition-all',
        'focus:outline-none focus:ring-2 focus:ring-red-500/30',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
// src/components/ui/Input.tsx
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700',
          'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm',
          'focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500',
          'placeholder:text-neutral-400',
          className,
        )}
        {...props}
      />
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, children, className = '', ...props }: SelectProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700',
          'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm',
          'focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md';
  color?: string;
  className?: string;
}

export function ProgressBar({ value, max = 100, size = 'md', color = 'bg-red-500', className = '' }: ProgressBarProps) {
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';
  return (
    <div className={cn('w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden', h, className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-300', color)}
        style={{ width: `${Math.min(Math.max(value, 0), max)}%` }}
      />
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
import { ElementType } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ElementType;
  color?: 'red' | 'orange' | 'green' | 'blue' | 'purple';
}

const ICON_COLORS = {
  red:    'bg-red-50    dark:bg-red-950/30    text-red-600',
  orange: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600',
  green:  'bg-green-50  dark:bg-green-950/30  text-green-600',
  blue:   'bg-blue-50   dark:bg-blue-950/30   text-blue-600',
  purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600',
};

export function StatCard({ title, value, subtitle, icon: Icon, color = 'red' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">{value}</p>
          {subtitle && <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>}
        </div>
        <div className={cn('p-2 rounded-lg shrink-0', ICON_COLORS[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
