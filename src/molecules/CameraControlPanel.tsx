import { Camera, CameraOff, Plus, Settings } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { Card, CardContent } from '../atoms/Card';
import { cn } from '../utils/cn';

interface CameraDevice {
  deviceId: string;
  label: string;
  isActive: boolean;
}

interface CameraControlPanelProps {
  cameras: CameraDevice[];
  onAddCamera: (deviceId: string) => Promise<void>;
  onRemoveCamera: (deviceId: string) => Promise<void>;
  onOpenSettings: () => void;
  maxCameras?: number;
  className?: string;
}

export const CameraControlPanel: React.FC<CameraControlPanelProps> = ({
  cameras,
  onAddCamera,
  onRemoveCamera,
  onOpenSettings,
  maxCameras = 4,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const activeCameras = cameras.filter(c => c.isActive);
  const inactiveCameras = cameras.filter(c => !c.isActive);
  const canAddMore = activeCameras.length < maxCameras;

  const handleToggleCamera = async (camera: CameraDevice) => {
    setIsLoading(camera.deviceId);
    try {
      if (camera.isActive) {
        await onRemoveCamera(camera.deviceId);
      } else {
        await onAddCamera(camera.deviceId);
      }
    } catch (error) {
      console.error('Error toggling camera:', error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card className={cn('', className)}>
      <CardContent className='p-4'>
        {/* Header */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <Camera size={18} className='text-primary' />
            <h3 className='font-semibold text-sm'>
              Cámaras ({activeCameras.length}/{cameras.length})
            </h3>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={onOpenSettings}
              className='h-8 w-8 p-0'
            >
              <Settings size={16} />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsExpanded(!isExpanded)}
              className='h-8 px-2 text-xs'
            >
              {isExpanded ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
        </div>

        {/* Active Cameras Summary */}
        <div className='space-y-2 mb-3'>
          {activeCameras.map(camera => (
            <div
              key={camera.deviceId}
              className='flex items-center justify-between p-2 bg-green-500/10 border border-green-500/20 rounded-md'
            >
              <div className='flex items-center gap-2 flex-1 min-w-0'>
                <Camera size={14} className='text-green-600 flex-shrink-0' />
                <span className='text-xs font-medium text-green-600 truncate'>
                  {camera.label}
                </span>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleToggleCamera(camera)}
                disabled={isLoading === camera.deviceId}
                className='h-6 px-2 text-xs hover:bg-red-500/10 hover:text-red-600'
              >
                {isLoading === camera.deviceId ? '...' : 'Desactivar'}
              </Button>
            </div>
          ))}
        </div>

        {/* Expandable section for inactive cameras */}
        {isExpanded && inactiveCameras.length > 0 && (
          <div className='space-y-2 pt-3 border-t'>
            <p className='text-xs text-muted-foreground mb-2'>
              Cámaras disponibles:
            </p>
            {inactiveCameras.map(camera => (
              <div
                key={camera.deviceId}
                className='flex items-center justify-between p-2 bg-muted/50 border border-border rounded-md'
              >
                <div className='flex items-center gap-2 flex-1 min-w-0'>
                  <CameraOff
                    size={14}
                    className='text-muted-foreground flex-shrink-0'
                  />
                  <span className='text-xs text-muted-foreground truncate'>
                    {camera.label}
                  </span>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleToggleCamera(camera)}
                  disabled={
                    !canAddMore || isLoading === camera.deviceId
                  }
                  className='h-6 px-2 text-xs hover:bg-green-500/10 hover:text-green-600'
                >
                  {isLoading === camera.deviceId ? '...' : (
                    <>
                      <Plus size={12} className='mr-1' />
                      Activar
                    </>
                  )}
                </Button>
              </div>
            ))}

            {!canAddMore && (
              <p className='text-xs text-orange-600 bg-orange-500/10 p-2 rounded-md'>
                ⚠️ Máximo de {maxCameras} cámaras alcanzado
              </p>
            )}
          </div>
        )}

        {/* Empty state */}
        {activeCameras.length === 0 && (
          <div className='text-center py-4'>
            <CameraOff size={32} className='text-muted-foreground mx-auto mb-2' />
            <p className='text-xs text-muted-foreground'>
              No hay cámaras activas
            </p>
            {inactiveCameras.length > 0 && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsExpanded(true)}
                className='mt-2 text-xs'
              >
                <Plus size={12} className='mr-1' />
                Agregar Cámara
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
