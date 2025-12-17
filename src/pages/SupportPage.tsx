import { AlertCircle, PhoneCall } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../atoms/Card';
import { Spinner } from '../atoms/Spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../atoms/Tabs';
import { useAuth } from '../context/AuthContext';
import { VideoCallPanel } from '../organisms/VideoCallPanel';
import { categoryService } from '../services/api';
import { ServiceCategory } from '../types';

export const SupportPage: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Detectar si se debe activar el tab de videollamada desde query params
  const tabFromQuery = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'services' | 'call'>(
    tabFromQuery === 'call' ? 'call' : 'services'
  );

  // Actualizar tab cuando cambie el query param
  useEffect(() => {
    if (tabFromQuery === 'call') {
      setActiveTab('call');
    } else if (tabFromQuery === 'services') {
      setActiveTab('services');
    }
  }, [tabFromQuery]);

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
      <div className='flex items-center justify-center h-full'>
        <Spinner size='lg' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-center'>
          <AlertCircle size={48} className='text-destructive mx-auto mb-4' />
          <h2 className='text-xl font-semibold mb-2'>
            Error al Cargar las Categorías de Soporte
          </h2>
          <p className='text-muted-foreground mb-4'>{error}</p>
          <Button onClick={() => window.location.reload()}>
            Intentar de Nuevo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>Servicios de Soporte</h1>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'services' | 'call')} className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='services'>
            <PhoneCall className='w-4 h-4 mr-2' />
            Soporte Remoto
          </TabsTrigger>
          <TabsTrigger value='call'>
            <PhoneCall className='w-4 h-4 mr-2' />
            Llamada Directa
          </TabsTrigger>
        </TabsList>

        <TabsContent value='services'>
          <Card>
            <CardHeader>
              <CardTitle>Soporte Remoto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-center py-8'>
                <div className='mb-6'>
                  <div className='mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
                    <PhoneCall size={32} className='text-primary' />
                  </div>
                  <h3 className='text-xl font-semibold mb-2'>
                    Asistencia Técnica Remota
                  </h3>
                  <p className='text-muted-foreground max-w-md mx-auto'>
                    Resolvemos problemas de Maquinaria Pesada de forma remota y
                    eficiente.
                  </p>
                </div>

                <div className='space-y-4'>
                  <Button
                    size='lg'
                    onClick={() => {
                      // Redirigir directamente a la creación de ticket
                      window.location.href = '/tickets/new';
                    }}
                    className='w-full max-w-sm'
                  >
                    <PhoneCall className='w-4 h-4 mr-2' />
                    Solicitar Soporte Remoto
                  </Button>

                  <p className='text-sm text-muted-foreground'>
                    Nuestro equipo técnico se conectará remotamente para
                    ayudarte
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='call'>
          <Card>
            <CardHeader>
              <CardTitle>Llamada de Soporte Directa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-[600px]'>
                {user && (
                  <VideoCallPanel
                    localUser={user}
                    recipientId='support' // ID del técnico de soporte
                    ticketId='direct-support' // ID del ticket de soporte directo
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
