import { Maximize2, Minimize2, PictureInPicture } from 'lucide-react';
import React from 'react';
import { Button } from '../atoms/Button';
import { cn } from '../utils/cn';

interface PictureInPictureControlProps {
  isPictureInPicture: boolean;
  isSupported: boolean;
  onToggle: () => void;
  variant?: 'button' | 'icon';
  className?: string;
  disabled?: boolean;
}

export const PictureInPictureControl: React.FC<
  PictureInPictureControlProps
> = ({
  isPictureInPicture,
  isSupported,
  onToggle,
  variant = 'button',
  className,
  disabled = false,
}) => {
  if (!isSupported) {
    return null;
  }

  const getIcon = () => {
    if (isPictureInPicture) {
      return <Minimize2 size={20} />;
    }
    return <PictureInPicture size={20} />;
  };

  const getLabel = () => {
    if (isPictureInPicture) {
      return 'Salir de PIP';
    }
    return 'Modo Flotante';
  };

  const getTitle = () => {
    if (isPictureInPicture) {
      return 'Salir del modo Picture-in-Picture (ventana flotante)';
    }
    return 'Activar modo Picture-in-Picture (ventana flotante)';
  };

  if (variant === 'icon') {
    return (
      <Button
        variant='ghost'
        size='sm'
        onClick={onToggle}
        disabled={disabled}
        title={getTitle()}
        className={cn(
          'h-10 w-10 p-0 rounded-full',
          isPictureInPicture && 'bg-blue-100 text-blue-600 hover:bg-blue-200',
          className
        )}
      >
        {getIcon()}
      </Button>
    );
  }

  return (
    <Button
      variant={isPictureInPicture ? 'default' : 'outline'}
      size='sm'
      onClick={onToggle}
      disabled={disabled}
      className={cn('flex items-center gap-2', className)}
      title={getTitle()}
    >
      {getIcon()}
      <span className='text-sm'>{getLabel()}</span>
    </Button>
  );
};

// Indicador de estado PIP para mostrar en la UI
export const PictureInPictureIndicator: React.FC<{
  isActive: boolean;
  className?: string;
}> = ({ isActive, className }) => {
  if (!isActive) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 bg-blue-100 border border-blue-200 rounded-md',
        className
      )}
    >
      <Maximize2 size={14} className='text-blue-600' />
      <span className='text-xs font-medium text-blue-600'>
        Modo Picture-in-Picture Activo
      </span>
    </div>
  );
};

// Badge compacto para mostrar en video
export const PictureInPictureBadge: React.FC<{
  isActive: boolean;
}> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className='absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs font-medium shadow-lg'>
      <PictureInPicture size={12} />
      PIP
    </div>
  );
};
