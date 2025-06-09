import React from 'react';
import { cn } from '../lib/utils';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            "w-11 h-6 bg-input rounded-full peer",
            "peer-checked:after:translate-x-full peer-checked:after:border-white",
            "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
            "after:bg-background after:border-gray-300 after:border after:rounded-full",
            "after:h-5 after:w-5 after:transition-all",
            "peer-checked:bg-primary",
            className
          )}
        />
      </label>
    );
  }
); 