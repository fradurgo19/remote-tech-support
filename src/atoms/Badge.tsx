import React from 'react';
import { cn } from '../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-medium',
          {
            'border border-border bg-background text-foreground': variant === 'default',
            'bg-primary text-primary-foreground': variant === 'primary',
            'bg-secondary text-secondary-foreground': variant === 'secondary',
            'bg-success text-success-foreground': variant === 'success',
            'bg-warning text-warning-foreground': variant === 'warning',
            'bg-destructive text-destructive-foreground': variant === 'danger',
          },
          {
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-0.5 text-sm': size === 'md',
            'px-3 py-1 text-sm': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';