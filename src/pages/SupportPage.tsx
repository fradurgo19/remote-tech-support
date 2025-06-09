import React, { useState, useEffect } from 'react';
import { ServiceCatalog } from '../organisms/ServiceCatalog';
import { ServiceCategory } from '../types';
import { categoryService } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../atoms/Card';
import { Spinner } from '../atoms/Spinner';
import { AlertCircle } from 'lucide-react';
import { Button } from '../atoms/Button';

export const SupportPage: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (err) {
        setError('Error al cargar las categorías de soporte');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error al Cargar las Categorías de Soporte</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Intentar de Nuevo</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Servicios de Soporte</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Servicios Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceCatalog 
            categories={categories}
            onSelectCategory={(categoryId) => {
              // Manejar selección de categoría
              console.log('Categoría seleccionada:', categoryId);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};