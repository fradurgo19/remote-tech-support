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

const LOGO_URL =
  'https://res.cloudinary.com/dbufrzoda/image/upload/v1762897590/Logo2_eedoer.jpg';

type FormState = {
  customerName: string;
  nit: string;
  phone: string;
  customerEmail: string;
  asesorRepuestos: string;
  tipoMaquina: string;
  marca: string;
  modeloEquipo: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
};

const FIELD_ORDER: (keyof FormState)[] = [
  'customerName',
  'nit',
  'phone',
  'customerEmail',
  'asesorRepuestos',
  'tipoMaquina',
  'marca',
  'modeloEquipo',
  'title',
  'description',
];

function isFieldFilled(_key: keyof FormState, value: string): boolean {
  return value.trim().length > 0;
}

export const PublicCreateTicketPage: React.FC = () => {
  const [formData, setFormData] = useState<FormState>({
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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setFormData(prev => ({ ...prev, category: 'Soporte Remoto' }));
  }, []);

  // Mostrar campo i solo cuando todos los anteriores están completos (y este también para poder editarlo)
  const firstIncompleteIndex = FIELD_ORDER.findIndex(key => !isFieldFilled(key, formData[key]));
  const lastVisibleIndex =
    firstIncompleteIndex < 0 ? FIELD_ORDER.length - 1 : firstIncompleteIndex;
  const canShowField = (index: number) => index <= lastVisibleIndex;
  const allFieldsFilled =
    FIELD_ORDER.every(key => isFieldFilled(key, formData[key]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allFieldsFilled) {
      toast.error('Complete todos los campos obligatorios.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      await ticketService.createTicketPublic({
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        phone: formData.phone.trim(),
        nit: formData.nit.trim(),
        asesorRepuestos: formData.asesorRepuestos.trim(),
        tipoMaquina: formData.tipoMaquina,
        marca: formData.marca,
        modeloEquipo: formData.modeloEquipo.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex flex-col items-center justify-center p-4 relative">
        <div className="absolute top-4 left-4 md:top-6 md:left-6">
          <img
            src={LOGO_URL}
            alt="Partequipos Logo"
            className="h-10 w-10 rounded-full object-cover"
          />
        </div>
        <Card className="max-w-md w-full bg-card shadow-lg border border-border">
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 relative">
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
        <img
          src={LOGO_URL}
          alt="Partequipos Logo"
          className="h-10 w-10 rounded-full object-cover"
        />
      </div>

      <div className="container max-w-2xl mx-auto py-8 px-4 pt-20 md:pt-24">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Solicitar soporte
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete cada campo en orden. Todos los campos son obligatorios.
            </p>
          </div>

          <Card className="bg-card shadow-lg border border-border">
            <CardHeader className="border-b border-border bg-muted/30">
              <CardTitle className="text-primary">
                Datos del cliente y equipo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {canShowField(0) && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label htmlFor="customerName" className="text-sm font-medium">
                      Nombre del cliente <span className="text-destructive">*</span>
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
                      autoFocus
                    />
                  </div>
                )}

                {canShowField(1) && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label htmlFor="nit" className="text-sm font-medium">
                      NIT <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="nit"
                      value={formData.nit}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData(prev => ({ ...prev, nit: e.target.value }))
                      }
                      placeholder="NIT"
                      required
                    />
                  </div>
                )}

                {canShowField(2) && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Teléfono <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData(prev => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="Teléfono de contacto"
                      required
                    />
                  </div>
                )}

                {canShowField(3) && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label htmlFor="customerEmail" className="text-sm font-medium">
                      Email <span className="text-destructive">*</span>
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
                )}

                {canShowField(4) && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label htmlFor="asesorRepuestos" className="text-sm font-medium">
                      Asesor de Repuestos <span className="text-destructive">*</span>
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
                      required
                    />
                  </div>
                )}

                {canShowField(5) && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label htmlFor="tipoMaquina" className="text-sm font-medium">
                      Tipo máquina <span className="text-destructive">*</span>
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
                      required
                    >
                      <option value="">Seleccione...</option>
                      {TIPOS_MAQUINA.map(t => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                {canShowField(6) && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label htmlFor="marca" className="text-sm font-medium">
                      Marca <span className="text-destructive">*</span>
                    </label>
                    <Select
                      id="marca"
                      value={formData.marca}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData(prev => ({ ...prev, marca: e.target.value }))
                      }
                      required
                    >
                      <option value="">Seleccione...</option>
                      {MARCAS.map(m => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                {canShowField(7) && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label htmlFor="modeloEquipo" className="text-sm font-medium">
                      Modelo equipo <span className="text-destructive">*</span>
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
                      required
                    />
                  </div>
                )}

                {canShowField(8) && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200 border-t border-border pt-4">
                    <h3 className="text-lg font-medium text-foreground">
                      Detalles del ticket
                    </h3>
                    <label htmlFor="title" className="text-sm font-medium">
                      Título <span className="text-destructive">*</span>
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
                )}

                {canShowField(9) && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label htmlFor="description" className="text-sm font-medium">
                      Descripción <span className="text-destructive">*</span>
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
                )}

                {allFieldsFilled && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 border-t border-border pt-4">
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
                        Asistencia técnica remota para Maquinaria Pesada
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="priority" className="text-sm font-medium">
                        Prioridad <span className="text-destructive">*</span>
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
                        required
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </Select>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      isLoading={isLoading}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Crear ticket
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
