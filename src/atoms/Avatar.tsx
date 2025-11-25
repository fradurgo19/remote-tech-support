import React from 'react';
import { cn } from '../utils/cn';
import { User as UserIcon } from 'lucide-react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'away' | 'busy' | 'offline';
  showStatusIndicator?: boolean;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = '', size = 'md', status, showStatusIndicator = true, ...props }, ref) => {
    // Mapeo de colores de estado con colores más visibles
    const statusColorMap = {
      online: 'bg-green-500', // Verde brillante para conectado
      away: 'bg-yellow-500', // Amarillo para recientemente conectado/ausente
      busy: 'bg-red-500', // Rojo para ocupado
      offline: 'bg-gray-400', // Gris para desconectado
    };

    // Clases adicionales para animación y visibilidad
    const statusAnimationMap = {
      online: 'animate-pulse shadow-lg shadow-green-500/50',
      away: 'shadow-lg shadow-yellow-500/50',
      busy: 'shadow-lg shadow-red-500/50',
      offline: '',
    };

    const sizeMap = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    };

    const statusSizeMap = {
      sm: 'h-2.5 w-2.5',
      md: 'h-3 w-3',
      lg: 'h-3.5 w-3.5',
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
        
        {showStatusIndicator && status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full ring-2 ring-background border border-white/50',
              statusSizeMap[size],
              statusColorMap[status],
              statusAnimationMap[status]
            )}
            title={
              status === 'online' ? 'Conectado' :
              status === 'away' ? 'Ausente / Recientemente conectado' :
              status === 'busy' ? 'Ocupado' :
              'Desconectado'
            }
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';