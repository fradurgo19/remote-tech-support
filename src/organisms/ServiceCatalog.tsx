import React, { useState } from 'react';
import { ServiceCategory } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../atoms/Card';
import { Input } from '../atoms/Input';
import { Search, Monitor, Wifi, HardDrive, User, AppWindow } from 'lucide-react';

interface ServiceCatalogProps {
  categories: ServiceCategory[];
  onSelectCategory: (categoryId: string) => void;
}

// Mapa de nombres de iconos a iconos reales de Lucide React
const iconMap: Record<string, React.ReactNode> = {
  'wifi': <Wifi size={24} />,
  'app-window': <AppWindow size={24} />,
  'hard-drive': <HardDrive size={24} />,
  'user': <User size={24} />,
  'monitor': <Monitor size={24} />,
};

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({
  categories,
  onSelectCategory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              onClick={() => onSelectCategory(category.id)}
            >
              <CardHeader className="pb-2">
                <div className="mb-2 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {iconMap[category.icon] || <Monitor size={24} />}
                </div>
                <CardTitle>{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{category.description}</p>
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