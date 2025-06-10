import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceCategory } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../atoms/Card';
import { Input } from '../atoms/Input';
import { Search, Monitor, Wifi, HardDrive, User, AppWindow, Headset } from 'lucide-react';
import { Button } from '../atoms/Button';

interface ServiceCatalogProps {
  categories: ServiceCategory[];
}

// Mapa de nombres de iconos a iconos reales de Lucide React
const iconMap: Record<string, React.ReactNode> = {
  'wifi': <Wifi size={24} />,
  'app-window': <AppWindow size={24} />,
  'hard-drive': <HardDrive size={24} />,
  'user': <User size={24} />,
  'monitor': <Monitor size={24} />,
};

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({ categories }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleServiceSelect = (category: ServiceCategory) => {
    // Redirigir directamente a la creación de ticket
    navigate('/tickets/new', { 
      state: { 
        category: category.id,
        title: `Soporte Remoto - ${category.name}`,
        description: 'Solicitud de asistencia técnica remota'
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Input
          placeholder="Buscar servicios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search size={18} />}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <Card 
              key={category.id} 
              hoverEffect
              className="cursor-pointer transition-all duration-200"
            >
              <CardHeader className="pb-2">
                <div className="mb-2 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {iconMap[category.icon] || <Monitor size={24} />}
                </div>
                <CardTitle>{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{category.description}</p>
                <Button 
                  onClick={() => handleServiceSelect(category)}
                  className="w-full mt-4"
                >
                  Solicitar Soporte
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No se encontraron servicios que coincidan con "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};