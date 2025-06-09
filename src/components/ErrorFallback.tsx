import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../atoms/Button';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-6 space-y-4 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle size={24} className="text-destructive" />
        </div>
        
        <h1 className="text-2xl font-bold">¡Ups! Algo salió mal</h1>
        
        <p className="text-muted-foreground">
          {error.message || 'Ha ocurrido un error inesperado'}
        </p>
        
        <div className="flex justify-center gap-4">
          <Button onClick={resetErrorBoundary}>
            Intentar de nuevo
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Recargar página
          </Button>
        </div>
      </div>
    </div>
  );
}; 