import { AlertTriangle } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../atoms/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      {/* Logo de la compañía - Esquina superior izquierda */}
      <div className='absolute top-4 left-4 md:top-6 md:left-6'>
        <img
          src='https://res.cloudinary.com/dbufrzoda/image/upload/v1750457354/Captura_de_pantalla_2025-06-20_170819_wzmyli.png'
          alt='Partequipos Logo'
          className='h-12 md:h-16 w-auto object-contain'
        />
      </div>

      <div className='text-center max-w-md p-8'>
        <div className='bg-muted h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6'>
          <AlertTriangle size={32} className='text-muted-foreground' />
        </div>
        <h1 className='text-4xl font-bold mb-2'>404</h1>
        <h2 className='text-2xl font-semibold mb-4'>Página No Encontrada</h2>
        <p className='text-muted-foreground mb-8'>
          La página que buscas no existe o ha sido movida.
        </p>
        <div className='flex justify-center space-x-4'>
          <Button onClick={() => navigate('/')} variant='primary'>
            Volver al Panel
          </Button>
          <Button onClick={() => navigate(-1)} variant='outline'>
            Regresar
          </Button>
        </div>
      </div>
    </div>
  );
};
