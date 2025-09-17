import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Ticket } from '../types';
import { ticketService, categoryService } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { Select } from '../atoms/Select';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

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
    tags: [] as string[]
  });
  
  const [categories, setCategories] = useState<Array<{id: string, name: string, description: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar categorías del backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData);
        if (categoriesData.length > 0 && !state?.category) {
          setFormData(prev => ({ ...prev, category: categoriesData[0].name }));
        }
      } catch (err) {
        console.error('Error al cargar categorías:', err);
        toast.error('Error al cargar las categorías');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, [state?.category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Debe iniciar sesión para crear un ticket');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await ticketService.createTicket({
        ...formData,
        customerId: user.id
      });
      toast.success('Ticket creado exitosamente');
      navigate('/tickets');
    } catch (err) {
      setError('Error al crear el ticket');
      console.error(err);
      toast.error('Error al crear el ticket');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Crear Nuevo Ticket</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título del ticket"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descripción
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe el problema o solicitud"
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Categoría
              </label>
              <Select
                id="category"
                value={formData.category}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  setFormData(prev => ({ ...prev, category: e.target.value }))}
                disabled={isLoadingCategories}
              >
                {isLoadingCategories ? (
                  <option value="">Cargando categorías...</option>
                ) : (
                  categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))
                )}
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Prioridad
              </label>
              <Select
                id="priority"
                value={formData.priority}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  setFormData(prev => ({ ...prev, priority: e.target.value as Ticket['priority'] }))}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </Select>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
              >
                Crear Ticket
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 