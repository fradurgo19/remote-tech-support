import {
  AppWindow,
  HardDrive,
  Headset,
  Monitor,
  User,
  Wifi,
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { ServiceCategory } from '../types';

interface ServiceCatalogProps {
  categories: ServiceCategory[];
}

// Mapa de nombres de iconos a iconos reales de Lucide React
const iconMap: Record<string, React.ReactNode> = {
  wifi: <Wifi size={24} />,
  'app-window': <AppWindow size={24} />,
  'hard-drive': <HardDrive size={24} />,
  user: <User size={24} />,
  monitor: <Monitor size={24} />,
  headset: <Headset size={24} />,
};

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({
  categories,
}) => {
  const navigate = useNavigate();

  const handleServiceSelect = () => {
    // Redirigir directamente a la creación de ticket
    navigate('/tickets/new', {
      state: {
        category: 'Soporte Remoto',
        title: 'Soporte Remoto',
        description: 'Solicitud de asistencia técnica remota',
      },
    });
  };

  // Mostrar siempre solo "Soporte Remoto"
  return (
    <div className='text-center'>
      <div className='mb-4'>
        <div className='mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3'>
          <Headset size={24} />
        </div>
        <h3 className='text-lg font-semibold mb-2'>Soporte Remoto</h3>
        <p className='text-sm text-muted-foreground mb-4'>
          Asistencia técnica remota para resolver problemas de Maquinaria Pesada
          de forma eficiente.
        </p>
      </div>
      <Button onClick={handleServiceSelect} className='w-full max-w-xs'>
        Solicitar Soporte
      </Button>
    </div>
  );
};
