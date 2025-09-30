import { Camera, CameraOff, X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { cn } from '../utils/cn';

interface CameraStreamProps {
  deviceId: string;
  stream: MediaStream;
  label: string;
  onRemove?: () => void;
  isMain?: boolean;
}

const CameraStream: React.FC<CameraStreamProps> = ({
  deviceId,
  stream,
  label,
  onRemove,
  isMain = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video && stream) {
      video.srcObject = stream;
      video.play().catch(console.error);
      setIsPlaying(true);
    }

    return () => {
      if (video) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <div
      className={cn(
        'relative rounded-lg overflow-hidden bg-black',
        isMain ? 'col-span-2 row-span-2' : 'aspect-video'
      )}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className='w-full h-full object-cover'
      />

      {/* Overlay con información */}
      <div className='absolute inset-0 pointer-events-none'>
        {/* Badge con el nombre */}
        <div className='absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md'>
          <div className='flex items-center gap-1'>
            <Camera size={12} className='text-white' />
            <span className='text-xs text-white font-medium'>
              {label}
              {isMain && ' (Principal)'}
            </span>
          </div>
        </div>

        {/* Botón de remover */}
        {!isMain && onRemove && (
          <div className='absolute top-2 right-2 pointer-events-auto'>
            <Button
              variant='destructive'
              size='sm'
              onClick={onRemove}
              className='h-6 w-6 p-0'
            >
              <X size={14} />
            </Button>
          </div>
        )}

        {/* Indicador de estado */}
        {!isPlaying && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
            <CameraOff size={32} className='text-white/60' />
          </div>
        )}
      </div>
    </div>
  );
};

interface MultipleCamerasGridProps {
  cameras: Array<{
    deviceId: string;
    stream: MediaStream;
    label: string;
  }>;
  onRemoveCamera?: (deviceId: string) => void;
  mainCameraId?: string;
  className?: string;
}

export const MultipleCamerasGrid: React.FC<MultipleCamerasGridProps> = ({
  cameras,
  onRemoveCamera,
  mainCameraId,
  className,
}) => {
  if (cameras.length === 0) {
    return (
      <Card className={cn('p-8', className)}>
        <div className='flex flex-col items-center justify-center text-center space-y-2'>
          <CameraOff size={48} className='text-muted-foreground' />
          <p className='text-sm text-muted-foreground'>
            No hay cámaras activas
          </p>
        </div>
      </Card>
    );
  }

  // Determinar el layout según el número de cámaras
  const getGridClass = () => {
    if (cameras.length === 1) {
      return 'grid grid-cols-1';
    }
    if (cameras.length === 2) {
      return 'grid grid-cols-2 gap-2';
    }
    if (cameras.length === 3) {
      return 'grid grid-cols-2 gap-2';
    }
    if (cameras.length === 4) {
      return 'grid grid-cols-2 gap-2';
    }
    // Para más de 4 cámaras, usar un grid más compacto
    return 'grid grid-cols-3 gap-2';
  };

  return (
    <div className={cn(getGridClass(), className)}>
      {cameras.map((camera, index) => (
        <CameraStream
          key={camera.deviceId}
          deviceId={camera.deviceId}
          stream={camera.stream}
          label={camera.label}
          onRemove={
            onRemoveCamera ? () => onRemoveCamera(camera.deviceId) : undefined
          }
          isMain={camera.deviceId === mainCameraId || index === 0}
        />
      ))}
    </div>
  );
};
