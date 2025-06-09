import React from 'react';
import { cn } from '../utils/cn';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'secondary';
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', variant = 'default', ...props }, ref) => {
    const sizeMap = {
      xs: 'h-3 w-3 border',
      sm: 'h-4 w-4 border-2',
      md: 'h-6 w-6 border-2',
      lg: 'h-8 w-8 border-3',
    };

    const variantMap = {
      default: 'border-muted-foreground border-t-foreground',
      primary: 'border-primary/30 border-t-primary',
      secondary: 'border-secondary/30 border-t-secondary',
    };

    return (
      <div ref={ref} role="status" {...props}>
        <div className="flex items-center justify-center">
          <div
            className={cn(
              'inline-block animate-spin rounded-full',
              sizeMap[size],
              variantMap[variant],
              className
            )}
          />
          <span className="sr-only">Cargando...</span>
        </div>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';