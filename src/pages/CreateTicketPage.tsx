import {
  AlertCircle,
  ArrowLeft,
  PhoneCall,
  Search,
  User,
  UserPlus,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../atoms/Card';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Textarea } from '../atoms/Textarea';
import { useAuth } from '../context/AuthContext';
import { ticketService, userService } from '../services/api';
import { Ticket, User as UserType } from '../types';

interface LocationState {
  category?: string;
  title?: string;
  description?: string;
}

export const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as LocationState;

  const [formData, setFormData] = useState({
    title: state?.title || '',
    description: state?.description || '',
    priority: 'medium' as Ticket['priority'],
    category: state?.category || '',
    status: 'open' as Ticket['status'],
    customerId: user?.id || '',
    customerEmail: '',
    customerName: '',
    tags: [] as string[],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para búsqueda de clientes
  const [customerSearch, setCustomerSearch] = useState('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<UserType | null>(
    null
  );
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);

  // Establecer categoría por defecto
  useEffect(() => {
    // Siempre establecer "Soporte Remoto" como categoría por defecto
    setFormData(prev => ({ ...prev, category: 'Soporte Remoto' }));
  }, []);

  // Cerrar búsqueda de clientes al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.customer-search-container')) {
        setShowCustomerSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Función para buscar clientes
  const searchCustomers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await userService.searchCustomers(query, query);
      setSearchResults(results);
    } catch (err) {
      console.error('Error al buscar clientes:', err);
      toast.error('Error al buscar clientes');
    } finally {
      setIsSearching(false);
    }
  };

  // Función para seleccionar un cliente
  const selectCustomer = (customer: UserType) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      customerEmail: customer.email,
      customerName: customer.name,
    }));
    setCustomerSearch(`${customer.name} (${customer.email})`);
    setShowCustomerSearch(false);
  };

  // Función para crear un cliente nuevo
  const createNewCustomer = () => {
    if (!formData.customerEmail) {
      toast.error('Ingresa un email para el cliente');
      return;
    }

    const newCustomer: UserType = {
      id: 'temp-' + Date.now(),
      name: formData.customerName || formData.customerEmail.split('@')[0],
      email: formData.customerEmail,
      role: 'customer',
      status: 'offline',
      avatar: '',
      emailVerified: false,
      passwordResetToken: null,
    };

    selectCustomer(newCustomer);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Debe iniciar sesión para crear un ticket');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Preparar datos del ticket según el rol del usuario
      const ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'> & {
        customerEmail?: string;
        customerName?: string;
      } = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        customerId: '',
        tags: formData.tags,
      };

      if (user.role === 'customer') {
        // Los clientes crean tickets para sí mismos
        ticketData.customerId = user.id;
      } else if (user.role === 'admin' || user.role === 'technician') {
        // El personal de soporte puede asignar tickets a clientes
        if (selectedCustomer) {
          ticketData.customerId = selectedCustomer.id;
        } else if (formData.customerEmail) {
          ticketData.customerEmail = formData.customerEmail;
          ticketData.customerName = formData.customerName;
        } else {
          toast.error(
            'Debes seleccionar o especificar un cliente para el ticket'
          );
          setIsLoading(false);
          return;
        }
      }

      await ticketService.createTicket(ticketData);
      toast.success('Ticket creado exitosamente');
      navigate('/tickets');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al crear el ticket';
      setError(errorMessage);
      console.error(err);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' onClick={() => navigate(-1)}>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <h1 className='text-2xl font-bold'>Crear Nuevo Ticket</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <label htmlFor='title' className='text-sm font-medium'>
                Título
              </label>
              <Input
                id='title'
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData(prev => ({ ...prev, title: e.target.value }))
                }
                placeholder='Título del ticket'
                required
              />
            </div>

            <div className='space-y-2'>
              <label htmlFor='description' className='text-sm font-medium'>
                Descripción
              </label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder='Describe el problema o solicitud'
                required
                rows={4}
              />
            </div>

            <div className='space-y-2'>
              <label htmlFor='category' className='text-sm font-medium'>
                Categoría
              </label>
              <div className='relative'>
                <Input
                  id='category'
                  value='Soporte Remoto'
                  disabled
                  className='bg-muted cursor-not-allowed'
                />
                <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                  <div className='h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center'>
                    <PhoneCall size={12} className='text-primary' />
                  </div>
                </div>
              </div>
              <p className='text-xs text-muted-foreground'>
                Asistencia técnica remota para resolver problemas de software,
                hardware y conectividad
              </p>
            </div>

            <div className='space-y-2'>
              <label htmlFor='priority' className='text-sm font-medium'>
                Prioridad
              </label>
              <Select
                id='priority'
                value={formData.priority}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFormData(prev => ({
                    ...prev,
                    priority: e.target.value as Ticket['priority'],
                  }))
                }
              >
                <option value='low'>Baja</option>
                <option value='medium'>Media</option>
                <option value='high'>Alta</option>
                <option value='urgent'>Urgente</option>
              </Select>
            </div>

            {/* Campos para asignación de cliente (solo para personal de soporte) */}
            {(user?.role === 'admin' || user?.role === 'technician') && (
              <div className='space-y-4 border-t pt-4'>
                <h3 className='text-lg font-medium'>Asignar a Cliente</h3>

                {/* Búsqueda de cliente existente */}
                <div className='space-y-2'>
                  <label
                    htmlFor='customerSearch'
                    className='text-sm font-medium'
                  >
                    Buscar Cliente Existente
                  </label>
                  <div className='relative customer-search-container'>
                    <Input
                      id='customerSearch'
                      value={customerSearch}
                      onChange={e => {
                        setCustomerSearch(e.target.value);
                        searchCustomers(e.target.value);
                        setShowCustomerSearch(true);
                      }}
                      placeholder='Buscar por nombre o email...'
                      leftIcon={<Search size={16} />}
                    />

                    {/* Resultados de búsqueda */}
                    {showCustomerSearch && searchResults.length > 0 && (
                      <div className='absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto'>
                        {searchResults.map(customer => (
                          <div
                            key={customer.id}
                            className='p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0'
                            onClick={() => selectCustomer(customer)}
                          >
                            <div className='flex items-center gap-3'>
                              <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                                <User size={16} className='text-primary' />
                              </div>
                              <div>
                                <p className='font-medium'>{customer.name}</p>
                                <p className='text-sm text-muted-foreground'>
                                  {customer.email}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {isSearching && (
                      <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary'></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* O crear cliente nuevo */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>
                    O crear cliente nuevo
                  </label>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Input
                        value={formData.customerName}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            customerName: e.target.value,
                          }))
                        }
                        placeholder='Nombre del cliente'
                      />
                    </div>
                    <div>
                      <Input
                        value={formData.customerEmail}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            customerEmail: e.target.value,
                          }))
                        }
                        placeholder='Email del cliente'
                        type='email'
                      />
                    </div>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={createNewCustomer}
                    leftIcon={<UserPlus size={16} />}
                    disabled={!formData.customerEmail}
                  >
                    Crear Cliente Nuevo
                  </Button>
                </div>

                {/* Cliente seleccionado */}
                {selectedCustomer && (
                  <div className='p-3 bg-muted rounded-md'>
                    <p className='text-sm font-medium'>Cliente seleccionado:</p>
                    <p className='text-sm text-muted-foreground'>
                      {selectedCustomer.name} ({selectedCustomer.email})
                    </p>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        setSelectedCustomer(null);
                        setCustomerSearch('');
                        setFormData(prev => ({
                          ...prev,
                          customerId: '',
                          customerEmail: '',
                          customerName: '',
                        }));
                      }}
                    >
                      Cambiar Cliente
                    </Button>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className='flex items-center gap-2 text-destructive text-sm'>
                <AlertCircle className='h-4 w-4' />
                <span>{error}</span>
              </div>
            )}

            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate(-1)}
              >
                Cancelar
              </Button>
              <Button type='submit' isLoading={isLoading}>
                Crear Ticket
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
