import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '../atoms/Button';

interface PermissionDeniedProps {
  message?: string;
  onGoBack?: () => void;
}

export const PermissionDenied: React.FC<PermissionDeniedProps> = ({ 
  message = 'No tienes permisos para acceder a este recurso',
  onGoBack 
}) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md">
        <div className="bg-destructive/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-destructive" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
        <p className="text-muted-foreground mb-6">{message}</p>
        {onGoBack && (
          <Button 
            variant="outline" 
            leftIcon={<ArrowLeft size={16} />}
            onClick={onGoBack}
          >
            Volver
          </Button>
        )}
      </div>
    </div>
  );
};
