import React from 'react';
import { cn } from '../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:opacity-50 disabled:pointer-events-none',
          
          // Variants
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/90': variant === 'secondary',
            'border border-input bg-background hover:bg-muted hover:text-foreground': variant === 'outline',
            'hover:bg-muted hover:text-foreground': variant === 'ghost',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
            'bg-success text-success-foreground hover:bg-success/90': variant === 'success',
          },
          
          // Sizes
          {
            'text-xs px-2.5 py-1.5 h-8': size === 'sm',
            'text-sm px-4 py-2 h-10': size === 'md',
            'text-base px-6 py-2.5 h-12': size === 'lg',
            'p-2.5 h-10 w-10': size === 'icon',
          },
          
          // Loading state
          {
            'relative !text-transparent transition-none': isLoading,
          },
          
          className
        )}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {leftIcon && <span className={cn('mr-2', { 'invisible': isLoading })}>{leftIcon}</span>}
        {children}
        {rightIcon && <span className={cn('ml-2', { 'invisible': isLoading })}>{rightIcon}</span>}
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
          </div>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';