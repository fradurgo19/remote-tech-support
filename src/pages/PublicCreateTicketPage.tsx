import { AlertCircle, PhoneCall } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '../atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../atoms/Card';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Textarea } from '../atoms/Textarea';
import { ticketService } from '../services/api';

const TIPOS_MAQUINA = [
  'Cargador',
  'Excavadora',
  'Minicargador',
  'Miniexcavadora',
  'Motoniveladora',
  'Retrocargador',
  'Soldador',
  'Tractor',
];

const MARCAS = ['Dynapac', 'Hitachi', 'Liugong', 'Yanmar'];

export const PublicCreateTicketPage: React.FC = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    nit: '',
    phone: '',
    customerEmail: '',
    asesorRepuestos: '',
    tipoMaquina: '',
    marca: '',
    modeloEquipo: '',
    title: '',
    description: '',
    category: 'Soporte Remoto',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setFormData(prev => ({ ...prev, category: 'Soporte Remoto' }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await ticketService.createTicketPublic({
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        phone: formData.phone || undefined,
        nit: formData.nit || undefined,
        asesorRepuestos: formData.asesorRepuestos || undefined,
        tipoMaquina: formData.tipoMaquina || undefined,
        marca: formData.marca || undefined,
        modeloEquipo: formData.modeloEquipo || undefined,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
      });
      toast.success('Ticket creado exitosamente. Recibirás un correo de confirmación.');
      setSuccess(true);
      setFormData({
        customerName: '',
        nit: '',
        phone: '',
        customerEmail: '',
        asesorRepuestos: '',
        tipoMaquina: '',
        marca: '',
        modeloEquipo: '',
        title: '',
        description: '',
        category: 'Soporte Remoto',
        priority: 'medium',
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al crear el ticket';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-primary">
              Ticket enviado correctamente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Hemos recibido tu solicitud. Recibirás un correo de confirmación y
              nuestro equipo te contactará a la brevedad.
            </p>
            <Button
              className="w-full"
              onClick={() => setSuccess(false)}
              variant="outline"
            >
              Crear otro ticket
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Solicitar soporte
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete el formulario para crear un ticket de soporte remoto.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Datos del cliente y equipo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="customerName" className="text-sm font-medium">
                    Nombre del cliente
                  </label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData(prev => ({
                        ...prev,
                        customerName: e.target.value,
                      }))
                    }
                    placeholder="Nombre completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="nit" className="text-sm font-medium">
                    NIT
                  </label>
                  <Input
                    id="nit"
                    value={formData.nit}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData(prev => ({ ...prev, nit: e.target.value }))
                    }
                    placeholder="NIT"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Teléfono
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData(prev => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="Teléfono de contacto"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="customerEmail" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData(prev => ({
                        ...prev,
                        customerEmail: e.target.value,
                      }))
                    }
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="asesorRepuestos"
                    className="text-sm font-medium"
                  >
                    Asesor de Repuestos
                  </label>
                  <Input
                    id="asesorRepuestos"
                    value={formData.asesorRepuestos}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData(prev => ({
                        ...prev,
                        asesorRepuestos: e.target.value,
                      }))
                    }
                    placeholder="Nombre del asesor"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="tipoMaquina" className="text-sm font-medium">
                    Tipo máquina
                  </label>
                  <Select
                    id="tipoMaquina"
                    value={formData.tipoMaquina}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFormData(prev => ({
                        ...prev,
                        tipoMaquina: e.target.value,
                      }))
                    }
                  >
                    <option value="">Seleccione...</option>
                    {TIPOS_MAQUINA.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="marca" className="text-sm font-medium">
                    Marca
                  </label>
                  <Select
                    id="marca"
                    value={formData.marca}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFormData(prev => ({ ...prev, marca: e.target.value }))
                    }
                  >
                    <option value="">Seleccione...</option>
                    {MARCAS.map(m => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="modeloEquipo" className="text-sm font-medium">
                    Modelo equipo
                  </label>
                  <Input
                    id="modeloEquipo"
                    value={formData.modeloEquipo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData(prev => ({
                        ...prev,
                        modeloEquipo: e.target.value,
                      }))
                    }
                    placeholder="Modelo del equipo"
                  />
                </div>

                <div className="border-t pt-4 space-y-4">
                  <h3 className="text-lg font-medium">Detalles del ticket</h3>

                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Título
                    </label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData(prev => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Título del ticket"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Descripción
                    </label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData(prev => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe el problema o solicitud"
                      required
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">
                      Categoría
                    </label>
                    <div className="relative">
                      <Input
                        id="category"
                        value="Soporte Remoto"
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                          <PhoneCall size={12} className="text-primary" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Asistencia técnica remota para resolver problemas de
                      Maquinaria Pesada
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">
                      Prioridad
                    </label>
                    <Select
                      id="priority"
                      value={formData.priority}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData(prev => ({
                          ...prev,
                          priority: e.target
                            .value as 'low' | 'medium' | 'high' | 'urgent',
                        }))
                      }
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </Select>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit" isLoading={isLoading}>
                    Crear ticket
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
