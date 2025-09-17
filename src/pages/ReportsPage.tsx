import {
  AlertCircle,
  Eye,
  FileText,
  Plus,
  Search,
  Trash2,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../atoms/Card';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Spinner } from '../atoms/Spinner';
import { Textarea } from '../atoms/Textarea';
import { useAuth } from '../context/AuthContext';
import { reportService, userService } from '../services/api';
import { Report, User as UserType } from '../types';

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Report['status'] | 'all'>(
    'all'
  );
  const [typeFilter, setTypeFilter] = useState<Report['type'] | 'all'>('all');

  // Estados para creación de informes
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'technical' as Report['type'],
    priority: 'medium' as Report['priority'],
    customerId: '',
    tags: [] as string[],
    attachments: [] as File[],
  });

  // Estados para búsqueda de clientes
  const [customerSearch, setCustomerSearch] = useState('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<UserType | null>(
    null
  );
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const reportsData = await reportService.getReports();
        setReports(reportsData as unknown as Report[]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al cargar los informes';
        setError(errorMessage);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para manejar archivos adjuntos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles],
      }));
    }
  };

  // Función para eliminar un archivo adjunto
  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

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
    }));
    setCustomerSearch(`${customer.name} (${customer.email})`);
    setShowCustomerSearch(false);
  };

  // Función para crear informe
  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Debe iniciar sesión para crear un informe');
      return;
    }

    try {
      // Convertir archivos a nombres de archivo para enviar al backend
      const attachmentNames = formData.attachments.map(file => file.name);

      const reportData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        customerId: formData.customerId,
        tags: formData.tags,
        attachments: attachmentNames,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await reportService.createReport(reportData as any);
      toast.success('Informe creado exitosamente');
      setIsCreating(false);
      setFormData({
        title: '',
        description: '',
        type: 'technical',
        priority: 'medium',
        customerId: '',
        tags: [],
        attachments: [],
      });
      setSelectedCustomer(null);
      setCustomerSearch('');

      // Recargar informes
      const reportsData = await reportService.getReports();
      setReports(reportsData as unknown as Report[]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al crear el informe';
      toast.error(errorMessage);
      console.error(err);
    }
  };

  // Función para eliminar informe
  const handleDeleteReport = async (reportId: string) => {
    if (
      !window.confirm('¿Estás seguro de que quieres eliminar este informe?')
    ) {
      return;
    }

    try {
      await reportService.deleteReport(reportId);
      toast.success('Informe eliminado exitosamente');
      setReports(reports.filter(report => report.id !== reportId));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al eliminar el informe';
      toast.error(errorMessage);
      console.error(err);
    }
  };

  // Filtrar informes
  const filteredReports = reports.filter(report => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Verificar permisos
  const canCreateReports =
    user?.role === 'admin' || user?.role === 'technician';
  const canManageReports =
    user?.role === 'admin' || user?.role === 'technician';

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
            Error al Cargar los Informes
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
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-2xl font-bold'>Informes de Soporte</h1>
        {canCreateReports && (
          <Button
            leftIcon={<Plus size={18} />}
            onClick={() => setIsCreating(true)}
          >
            Nuevo Informe
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className='flex flex-col md:flex-row gap-4'>
        <div className='w-full md:max-w-md'>
          <Input
            placeholder='Buscar informes...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>

        <div className='flex flex-wrap gap-2'>
          <div className='inline-flex items-center rounded-md border border-input bg-background px-3 h-10 text-sm'>
            <span className='text-muted-foreground mr-2'>Estado:</span>
            <select
              className='bg-transparent border-none outline-none'
              value={statusFilter}
              onChange={e =>
                setStatusFilter(e.target.value as Report['status'] | 'all')
              }
            >
              <option value='all'>Todos</option>
              <option value='draft'>Borrador</option>
              <option value='pending'>Pendiente</option>
              <option value='approved'>Aprobado</option>
              <option value='rejected'>Rechazado</option>
            </select>
          </div>

          <div className='inline-flex items-center rounded-md border border-input bg-background px-3 h-10 text-sm'>
            <span className='text-muted-foreground mr-2'>Tipo:</span>
            <select
              className='bg-transparent border-none outline-none'
              value={typeFilter}
              onChange={e =>
                setTypeFilter(e.target.value as Report['type'] | 'all')
              }
            >
              <option value='all'>Todos</option>
              <option value='technical'>Técnico</option>
              <option value='incident'>Incidente</option>
              <option value='maintenance'>Mantenimiento</option>
              <option value='performance'>Rendimiento</option>
              <option value='security'>Seguridad</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de informes */}
      {filteredReports.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredReports.map(report => (
            <Card key={report.id} className='hover:shadow-md transition-shadow'>
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <CardTitle className='text-lg line-clamp-2'>
                      {report.title}
                    </CardTitle>
                    <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                      {report.description}
                    </p>
                  </div>
                  <div className='flex gap-1 ml-2'>
                    <Badge
                      variant={
                        report.status === 'approved'
                          ? 'default'
                          : report.status === 'pending'
                          ? 'secondary'
                          : report.status === 'rejected'
                          ? 'danger'
                          : 'default'
                      }
                    >
                      {report.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='space-y-2 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-2'>
                    <User size={14} />
                    <span>Cliente: {report.customer?.name || 'N/A'}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <FileText size={14} />
                    <span>Tipo: {report.type}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span>Prioridad: {report.priority}</span>
                  </div>
                  {report.ticket && (
                    <div className='flex items-center gap-2'>
                      <span>Ticket: {report.ticket.title}</span>
                    </div>
                  )}
                  {report.attachments && report.attachments.length > 0 && (
                    <div className='flex items-center gap-2'>
                      <FileText size={14} />
                      <span>{report.attachments.length} adjunto(s)</span>
                    </div>
                  )}
                  <div className='text-xs'>
                    Creado: {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className='flex gap-2 mt-4'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => navigate(`/reports/${report.id}`)}
                    className='flex-1'
                  >
                    <Eye size={14} className='mr-1' />
                    Ver
                  </Button>
                  {canManageReports && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-lg bg-muted/20'>
          <div className='bg-muted h-16 w-16 rounded-full flex items-center justify-center mb-4'>
            <FileText size={24} className='text-muted-foreground' />
          </div>
          <h3 className='text-lg font-medium mb-2'>
            No se encontraron informes
          </h3>
          <p className='text-muted-foreground text-sm mb-4'>
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Intenta ajustar tus filtros'
              : canCreateReports
              ? 'Crea tu primer informe de soporte para comenzar'
              : 'No tienes informes asignados'}
          </p>
          {canCreateReports && (
            <Button variant='outline' onClick={() => setIsCreating(true)}>
              Crear Informe
            </Button>
          )}
        </div>
      )}

      {/* Modal de creación de informe */}
      {isCreating && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <h2 className='text-xl font-bold mb-4'>Crear Nuevo Informe</h2>
            <form onSubmit={handleCreateReport} className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium'>Título</label>
                  <Input
                    value={formData.title}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, title: e.target.value }))
                    }
                    placeholder='Título del informe'
                    required
                  />
                </div>
                <div>
                  <label className='text-sm font-medium'>Tipo</label>
                  <Select
                    value={formData.type}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        type: e.target.value as Report['type'],
                      }))
                    }
                  >
                    <option value='technical'>Técnico</option>
                    <option value='incident'>Incidente</option>
                    <option value='maintenance'>Mantenimiento</option>
                    <option value='performance'>Rendimiento</option>
                    <option value='security'>Seguridad</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className='text-sm font-medium'>Descripción</label>
                <Textarea
                  value={formData.description}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder='Descripción del informe'
                  rows={6}
                  required
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium'>Prioridad</label>
                  <Select
                    value={formData.priority}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        priority: e.target.value as Report['priority'],
                      }))
                    }
                  >
                    <option value='low'>Baja</option>
                    <option value='medium'>Media</option>
                    <option value='high'>Alta</option>
                    <option value='urgent'>Urgente</option>
                  </Select>
                </div>
                <div>
                  <label className='text-sm font-medium'>Cliente *</label>
                  <div className='relative'>
                    <Input
                      value={customerSearch}
                      onChange={e => {
                        setCustomerSearch(e.target.value);
                        searchCustomers(e.target.value);
                        setShowCustomerSearch(true);
                      }}
                      placeholder='Buscar cliente...'
                      leftIcon={<User size={16} />}
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

                  {/* Cliente seleccionado */}
                  {selectedCustomer && (
                    <div className='mt-2 p-2 bg-muted rounded-md'>
                      <p className='text-sm font-medium'>
                        Cliente seleccionado:
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {selectedCustomer.name} ({selectedCustomer.email})
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sección de archivos adjuntos */}
              <div>
                <label className='text-sm font-medium'>Archivos Adjuntos</label>
                <div className='mt-2'>
                  <input
                    type='file'
                    multiple
                    onChange={handleFileChange}
                    className='w-full p-2 border border-input rounded-md bg-background'
                    accept='.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif'
                  />
                  <p className='text-xs text-muted-foreground mt-1'>
                    Formatos permitidos: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG,
                    GIF
                  </p>
                </div>

                {/* Lista de archivos seleccionados */}
                {formData.attachments.length > 0 && (
                  <div className='mt-3'>
                    <p className='text-sm font-medium mb-2'>
                      Archivos seleccionados:
                    </p>
                    <div className='space-y-2'>
                      {formData.attachments.map((file, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between p-2 bg-muted rounded-md'
                        >
                          <div className='flex items-center gap-2'>
                            <FileText
                              size={16}
                              className='text-muted-foreground'
                            />
                            <span className='text-sm'>{file.name}</span>
                            <span className='text-xs text-muted-foreground'>
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => removeAttachment(index)}
                            className='text-destructive hover:text-destructive'
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className='flex justify-end gap-2 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setIsCreating(false);
                    setFormData({
                      title: '',
                      description: '',
                      type: 'technical',
                      priority: 'medium',
                      customerId: '',
                      tags: [],
                      attachments: [],
                    });
                    setSelectedCustomer(null);
                    setCustomerSearch('');
                    setShowCustomerSearch(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type='submit' disabled={!selectedCustomer}>
                  Crear Informe
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
