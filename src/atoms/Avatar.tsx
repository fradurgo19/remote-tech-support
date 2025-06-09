import React from 'react';
import { cn } from '../utils/cn';
import { User as UserIcon } from 'lucide-react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'away' | 'busy' | 'offline';
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = '', size = 'md', status, ...props }, ref) => {
    const statusColorMap = {
      online: 'bg-success',
      away: 'bg-warning',
      busy: 'bg-destructive',
      offline: 'bg-muted-foreground',
    };

    const sizeMap = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    };

    const statusSizeMap = {
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4',
    };

    return (
      <div
        ref={ref}
        className={cn('relative rounded-full', sizeMap[size], className)}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <div className="h-full w-full rounded-full bg-muted flex items-center justify-center">
            <UserIcon className="h-1/2 w-1/2 text-muted-foreground" />
          </div>
        )}
        
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full ring-2 ring-background',
              statusSizeMap[size],
              statusColorMap[status]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';