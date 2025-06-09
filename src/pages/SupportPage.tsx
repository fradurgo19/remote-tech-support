import React, { useState, useEffect } from 'react';
import { ServiceCatalog } from '../organisms/ServiceCatalog';
import { ServiceCategory } from '../types';
import { categoryService } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../atoms/Card';
import { Spinner } from '../atoms/Spinner';
import { AlertCircle, PhoneCall } from 'lucide-react';
import { Button } from '../atoms/Button';
import { VideoCallPanel } from '../organisms/VideoCallPanel';
import { useAuth } from '../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../atoms/Tabs';

export const SupportPage: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

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
      
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">
            <PhoneCall className="w-4 h-4 mr-2" />
            Servicios
          </TabsTrigger>
          <TabsTrigger value="call">
            <PhoneCall className="w-4 h-4 mr-2" />
            Llamada Directa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services">
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
        </TabsContent>

        <TabsContent value="call">
          <Card>
            <CardHeader>
              <CardTitle>Llamada de Soporte Directa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[600px]">
                {user && (
                  <VideoCallPanel
                    localUser={user}
                    recipientId="support" // ID del técnico de soporte
                    ticketId="direct-support" // ID del ticket de soporte directo
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};