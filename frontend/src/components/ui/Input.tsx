// src/components/ui/Input.tsx
import { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

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
