import {
  Calendar,
  CheckCircle,
  Clock,
  ClipboardList,
  Forward,
  Layers,
  MessageSquare,
  Play,
  RefreshCw,
  Tag,
  UserPlus,
  Video,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Avatar } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Card, CardContent, CardFooter, CardHeader } from '../atoms/Card';
import { Textarea } from '../atoms/Textarea';
import { Ticket, User } from '../types';

/** Lista de sistemas que el técnico puede seleccionar como comprometidos en la falla */
const SISTEMAS_OPTIONS = [
  'Motor (Pistones, cigüeñal, bielas, culata, árbol de levas, válvulas)',
  'Turbocargador y Posenfriador',
  'Inyectores y Bomba de inyección',
  'Radiador, Bomba de agua y Termostato',
  'Alternador, Baterías y Motor de arranque',
  'Convertidor de par',
  'Transmisión (Planetarios, embragues, ejes)',
  'Diferenciales y Semiejes',
  'Mandos finales y Sellos Duo-Cone',
  'Bombas hidráulicas (Principal y de pilotaje)',
  'Banco de válvulas de control',
  'Cilindros hidráulicos (Vástagos, sellos, émbolos)',
  'Motores de giro y Motores de traslación',
  'Mangueras y Acoples de alta presión',
  'Tanques (Combustible, aceite hidráulico, DEF)',
  'Filtros (Aire, aceite, combustible, hidráulico)',
  'Cadenas, Eslabones, Bujes y Pasadores',
  'Zapatas y Pernos de zapata',
  'Rodillos (Superiores e inferiores)',
  'Rueda guía (Idler) y Rueda dentada (Sprocket)',
  'Neumáticos, Rines y Masas',
  'Bastidor (Chasis) y Contrapesos',
  'Cojinete de giro (Tornamesa)',
  'Articulaciones y Osciladores',
  'Pluma (Boom) y Brazo (Stick)',
  'Cucharón, Dientes, Adaptadores y Cuchillas',
  'Cabina (Asiento, mandos, pedales)',
  'Módulos de Control Electrónico (ECM)',
  'Sensores y Arneses eléctricos',
  'Panel de instrumentos y Pantallas de monitoreo',
  'Estructuras ROPS y FOPS',
  'Frenos de disco y Acumuladores de freno',
  'Unidades de dirección (Orbitroles y cilindros)',
  'Sistema de escape y Silenciadores',
  'Sistema post-tratamiento de gases',
];

const STATUS_VARIANT_MAP: Record<
  Ticket['status'],
  'primary' | 'secondary' | 'success' | 'default'
> = {
  open: 'primary',
  in_progress: 'secondary',
  resolved: 'success',
  closed: 'default',
  redirected: 'secondary',
};

const PRIORITY_VARIANT_MAP: Record<
  Ticket['priority'],
  'primary' | 'secondary' | 'success' | 'default'
> = {
  low: 'default',
  medium: 'secondary',
  high: 'primary',
  urgent: 'success',
};

const STATUS_TRANSLATIONS: Record<Ticket['status'], string> = {
  open: 'abierto',
  in_progress: 'en progreso',
  resolved: 'resuelto',
  closed: 'cerrado',
  redirected: 'redireccionado',
};

const PRIORITY_TRANSLATIONS: Record<Ticket['priority'], string> = {
  low: 'baja',
  medium: 'media',
  high: 'alta',
  urgent: 'urgente',
};

const OBSERVATIONS_TEXTAREA_ID = 'ticket-observations-textarea';

const TicketNumberAndModelBadges: React.FC<{
  ticketId: string;
  modeloEquipo?: string | null;
  formatTicketId: (id: string) => string;
}> = ({ ticketId, modeloEquipo, formatTicketId }) => (
  <>
    <Badge>#{formatTicketId(ticketId)}</Badge>
    {modeloEquipo?.trim() ? (
      <Badge
        variant='secondary'
        className='max-w-[min(100%,280px)] truncate font-normal'
        title={modeloEquipo.trim()}
      >
        {modeloEquipo.trim()}
      </Badge>
    ) : null}
  </>
);

/** Normaliza un nombre de sistema para usarlo como id de input. */
function sistemaToInputId(sistema: string): string {
  // replaceAll requiere ES2021; replace con regex global es equivalente aquí
  return sistema.replace(/\s+/g, '-'); // NOSONAR
}

interface ObservationsModalProps {
  show: boolean;
  pendingStatus: Ticket['status'] | null;
  technicalObservations: string;
  onObservationsChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isChangingStatus: boolean;
}

const ObservationsModal: React.FC<ObservationsModalProps> = ({
  show,
  pendingStatus,
  technicalObservations,
  onObservationsChange,
  onConfirm,
  onCancel,
  isChangingStatus,
}) => {
  if (!show) return null;
  const statusLabel = pendingStatus
    ? STATUS_TRANSLATIONS[pendingStatus]
    : '';
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-background rounded-lg p-6 w-full max-w-md mx-4 shadow-xl'>
        <h3 className='text-lg font-semibold mb-4'>
          Cambiar estado a: {statusLabel}
        </h3>
        <div className='mb-4'>
          <label
            htmlFor={OBSERVATIONS_TEXTAREA_ID}
            className='block text-sm font-medium mb-2'
          >
            Observaciones Técnicas (opcional)
          </label>
          <Textarea
            id={OBSERVATIONS_TEXTAREA_ID}
            value={technicalObservations}
            onChange={e => onObservationsChange(e.target.value)}
            placeholder='Ingrese observaciones técnicas sobre este cambio de estado...'
            rows={4}
            className='w-full'
          />
        </div>
        <div className='flex gap-2 justify-end'>
          <Button variant='outline' onClick={onCancel} disabled={isChangingStatus}>
            Cancelar
          </Button>
          <Button
            variant='primary'
            onClick={onConfirm}
            disabled={isChangingStatus}
          >
            {isChangingStatus ? 'Procesando...' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface TicketDetailsFooterProps {
  status: Ticket['status'];
  canChangeStatus: boolean;
  isChangingStatus: boolean;
  onStartChat: () => void;
  onStartCall: () => void;
  onStatusChange: (s: Ticket['status']) => void;
  onOpenCloseModal: () => void;
}

const TicketDetailsFooter: React.FC<TicketDetailsFooterProps> = ({
  status,
  canChangeStatus,
  isChangingStatus,
  onStartChat,
  onStartCall,
  onStatusChange,
  onOpenCloseModal,
}) => (
  <CardFooter className='border-t pt-4 flex flex-col sm:flex-row gap-2'>
    <Button variant='outline' leftIcon={<MessageSquare size={16} />} onClick={onStartChat} className='w-full sm:w-auto'>
      Chat
    </Button>
    <Button leftIcon={<Video size={16} />} onClick={onStartCall} className='w-full sm:w-auto'>
      Videollamada
    </Button>
    {canChangeStatus && status === 'open' && (
      <Button
        variant='secondary'
        leftIcon={<Play size={16} />}
        onClick={() => onStatusChange('in_progress')}
        disabled={isChangingStatus}
        className='w-full sm:w-auto'
      >
        {isChangingStatus ? 'Procesando...' : 'En Progreso'}
      </Button>
    )}
    {canChangeStatus && status !== 'resolved' && status !== 'closed' && status !== 'redirected' && (
      <Button
        variant='secondary'
        leftIcon={<Forward size={16} />}
        onClick={() => onStatusChange('redirected')}
        disabled={isChangingStatus}
        className='w-full sm:w-auto'
      >
        {isChangingStatus ? 'Procesando...' : 'Redireccionado'}
      </Button>
    )}
    {status !== 'resolved' && status !== 'closed' && (
      <Button
        variant='success'
        leftIcon={<CheckCircle size={16} />}
        onClick={() => onStatusChange('resolved')}
        disabled={isChangingStatus}
        className='w-full sm:w-auto sm:ml-auto'
      >
        {isChangingStatus ? 'Procesando...' : 'Marcar como Resuelto'}
      </Button>
    )}
    {status !== 'closed' && status === 'resolved' && canChangeStatus && (
      <Button
        variant='outline'
        leftIcon={<XCircle size={16} />}
        onClick={onOpenCloseModal}
        disabled={isChangingStatus}
        className='w-full sm:w-auto sm:ml-auto'
      >
        {isChangingStatus ? 'Procesando...' : 'Cerrar Ticket'}
      </Button>
    )}
    {status !== 'closed' && status === 'resolved' && !canChangeStatus && (
      <Button
        variant='outline'
        leftIcon={<XCircle size={16} />}
        onClick={() => onStatusChange('closed')}
        disabled={isChangingStatus}
        className='w-full sm:w-auto sm:ml-auto'
      >
        {isChangingStatus ? 'Procesando...' : 'Cerrar Ticket'}
      </Button>
    )}
  </CardFooter>
);

interface TicketDetailsProps {
  ticket: Ticket;
  customer?: User;
  technician?: User;
  currentUser?: User;
  availableTechnicians?: User[];
  onStartCall: () => void;
  onStartChat: () => void;
  onChangeStatus: (status: Ticket['status'], technicalObservations?: string) => void | Promise<void>;
  onAssignTechnician?: (technicianId: string) => void;
  onUpdateSistemas?: (sistemas: string[]) => void | Promise<void>;
}

export const TicketDetails: React.FC<TicketDetailsProps> = ({
  ticket,
  customer,
  technician,
  currentUser,
  availableTechnicians,
  onStartCall,
  onStartChat,
  onChangeStatus,
  onAssignTechnician,
  onUpdateSistemas,
}) => {
  const [isAssigningTechnician, setIsAssigningTechnician] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');
  const [showObservationsModal, setShowObservationsModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Ticket['status'] | null>(null);
  const [technicalObservations, setTechnicalObservations] = useState('');
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isEditingSistemas, setIsEditingSistemas] = useState(false);
  const [pendingSistemas, setPendingSistemas] = useState<string[]>(
    ticket.sistemas ?? []
  );
  const [isSavingSistemas, setIsSavingSistemas] = useState(false);

  useEffect(() => {
    if (!isEditingSistemas) {
      setPendingSistemas(ticket.sistemas ?? []);
    }
  }, [ticket.sistemas, isEditingSistemas]);

  const canEditSistemas =
    currentUser &&
    (currentUser.role === 'admin' || currentUser.role === 'technician') &&
    onUpdateSistemas;

  const handleToggleSistema = (sistema: string) => {
    setPendingSistemas(prev =>
      prev.includes(sistema)
        ? prev.filter(s => s !== sistema)
        : [...prev, sistema]
    );
  };

  const handleSaveSistemas = () => {
    if (!onUpdateSistemas || isSavingSistemas) return;
    setIsSavingSistemas(true);
    Promise.resolve(onUpdateSistemas(pendingSistemas))
      .then(() => setIsEditingSistemas(false))
      .finally(() => setIsSavingSistemas(false));
  };

  const {
    id,
    title,
    description,
    status,
    priority,
    createdAt,
    updatedAt,
    tags,
  } = ticket;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('es-ES');

  const formatTicketId = (ticketId: string) =>
    ticketId.substring(0, 8).toUpperCase();

  // Función para manejar la asignación de técnico
  const handleAssignTechnician = () => {
    if (selectedTechnicianId && onAssignTechnician) {
      onAssignTechnician(selectedTechnicianId);
      setIsAssigningTechnician(false);
      setSelectedTechnicianId('');
    }
  };

  // Función para cancelar la asignación
  const handleCancelAssignment = () => {
    setIsAssigningTechnician(false);
    setSelectedTechnicianId('');
  };

  // Función para iniciar la reasignación
  const handleStartReassignment = () => {
    setIsAssigningTechnician(true);
    setSelectedTechnicianId('');
  };

  // Verificar si el usuario puede asignar técnicos
  const canAssignTechnician =
    currentUser &&
    (currentUser.role === 'admin' || currentUser.role === 'technician') &&
    availableTechnicians &&
    availableTechnicians.length > 0;

  // Variable local para el técnico actual
  const currentTechnician = technician;

  // Verificar si el usuario puede cambiar estados (admin o técnico)
  const canChangeStatus =
    currentUser &&
    (currentUser.role === 'admin' || currentUser.role === 'technician');

  // Función para manejar cambio de estado con modal de observaciones
  const handleStatusChange = (newStatus: Ticket['status']) => {
    if (isChangingStatus) return; // Prevenir doble click
    
    // Para técnicos/admin, mostrar modal de observaciones en cambios importantes
    if (canChangeStatus && (newStatus === 'in_progress' || newStatus === 'resolved' || newStatus === 'redirected' || newStatus === 'closed')) {
      setPendingStatus(newStatus);
      setShowObservationsModal(true);
    } else {
      setIsChangingStatus(true);
      onChangeStatus(newStatus);
      setTimeout(() => setIsChangingStatus(false), 2000);
    }
  };

  const handleConfirmStatusChange = () => {
    if (!pendingStatus || isChangingStatus) return;
    setIsChangingStatus(true);
    const result = onChangeStatus(
      pendingStatus,
      technicalObservations || undefined
    );
    const closeModal = () => {
      setShowObservationsModal(false);
      setPendingStatus(null);
      setTechnicalObservations('');
      setTimeout(() => setIsChangingStatus(false), 2000);
    };
    Promise.resolve(result).then(closeModal).catch(() => setIsChangingStatus(false));
  };

  // Función para cancelar cambio de estado
  const handleCancelStatusChange = () => {
    setShowObservationsModal(false);
    setPendingStatus(null);
    setTechnicalObservations('');
  };

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader>
        <div className='flex flex-col space-y-3'>
          <div className='flex flex-wrap gap-2 mb-1'>
            <Badge variant={STATUS_VARIANT_MAP[status]} className='capitalize'>
              {STATUS_TRANSLATIONS[status]}
            </Badge>
            <Badge
              variant={PRIORITY_VARIANT_MAP[priority]}
              className='capitalize'
            >
              {PRIORITY_TRANSLATIONS[priority]}
            </Badge>
            <TicketNumberAndModelBadges
              ticketId={id}
              modeloEquipo={ticket.modeloEquipo}
              formatTicketId={formatTicketId}
            />
          </div>

          <h2 className='text-xl font-bold'>{title}</h2>

          <div className='flex flex-wrap gap-2'>
            {tags.map(tag => (
              <Badge
                key={tag}
                variant='secondary'
                className='flex items-center gap-1'
              >
                <Tag size={12} />
                {tag}
              </Badge>
            ))}
          </div>

          <div className='flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground pt-1'>
            <div className='flex items-center'>
              <Calendar size={16} className='mr-1.5' />
              <span>Creado: {formatDate(createdAt)}</span>
            </div>

            <div className='flex items-center'>
              <Clock size={16} className='mr-1.5' />
              <span>Actualizado: {formatDate(updatedAt)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='flex-1 overflow-auto'>
        <div className='space-y-6'>
          <div>
            <h3 className='text-base font-medium mb-2'>Descripción</h3>
            <div className='bg-muted/50 p-3 rounded-md text-sm'>
              {description}
            </div>
          </div>

          {/* Observaciones Técnicas */}
          {ticket.technicalObservations && (
            <div>
              <h3 className='text-base font-medium mb-2 flex items-center gap-2'>
                <ClipboardList size={16} className='text-primary' />
                Observaciones Técnicas
              </h3>
              <div className='bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 rounded-md text-sm'>
                <div className='whitespace-pre-wrap text-gray-700 dark:text-gray-300'>
                  {ticket.technicalObservations}
                </div>
              </div>
            </div>
          )}

          {/* Sistema(s) comprometido(s) - falla del equipo */}
          <div>
            <h3 className='text-base font-medium mb-2 flex items-center gap-2'>
              <Layers size={16} className='text-primary' />
              Sistema(s) comprometido(s)
            </h3>
            {isEditingSistemas ? (
              <div className='space-y-3'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                  {SISTEMAS_OPTIONS.map(sistema => {
                    const inputId = `sistema-${sistemaToInputId(sistema)}`;
                    return (
                      <label
                        key={sistema}
                        htmlFor={inputId}
                        className='flex items-center gap-2 p-2 rounded-md border border-border hover:bg-muted/50 cursor-pointer'
                      >
                        <input
                          id={inputId}
                          type='checkbox'
                          checked={pendingSistemas.includes(sistema)}
                          onChange={() => handleToggleSistema(sistema)}
                          className='rounded border-border'
                          aria-label={`Sistema ${sistema}`}
                        />
                        <span className='text-sm'>{sistema}</span>
                      </label>
                    );
                  })}
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='primary'
                    size='sm'
                    onClick={handleSaveSistemas}
                    disabled={isSavingSistemas}
                  >
                    {isSavingSistemas ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setIsEditingSistemas(false);
                      setPendingSistemas(ticket.sistemas ?? []);
                    }}
                    disabled={isSavingSistemas}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className='bg-muted/50 p-3 rounded-md'>
                {(ticket.sistemas?.length ?? 0) > 0 ? (
                  <div className='flex flex-wrap gap-2'>
                    {(ticket.sistemas ?? []).map(sistema => (
                      <Badge
                        key={sistema}
                        variant='secondary'
                        className='flex items-center gap-1'
                      >
                        <Layers size={12} />
                        {sistema}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No definido. El técnico puede seleccionar uno o varios
                    sistemas.
                  </p>
                )}
                {canEditSistemas && (
                  <Button
                    variant='outline'
                    size='sm'
                    className='mt-2'
                    onClick={() => setIsEditingSistemas(true)}
                  >
                    {(ticket.sistemas?.length ?? 0) > 0
                      ? 'Editar sistemas'
                      : 'Seleccionar sistemas'}
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className='space-y-3'>
            <h3 className='text-base font-medium'>Personas</h3>

            <div className='flex items-center justify-between bg-card border border-border p-3 rounded-md'>
              <div className='flex items-center'>
                <Avatar src={customer?.avatar} status={customer?.status} />
                <div className='ml-3'>
                  <p className='font-medium'>
                    {customer?.name || 'Cliente Desconocido'}
                  </p>
                  <p className='text-xs text-muted-foreground'>Cliente</p>
                </div>
              </div>
            </div>

            {technician ? (
              <div className='flex items-center justify-between bg-card border border-border p-3 rounded-md'>
                <div className='flex items-center'>
                  <Avatar src={technician.avatar} status={technician.status} />
                  <div className='ml-3'>
                    <p className='font-medium'>{technician.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      Técnico de Soporte
                    </p>
                  </div>
                </div>
                {canAssignTechnician && !isAssigningTechnician && (
                  <Button
                    variant='outline'
                    size='sm'
                    leftIcon={<RefreshCw size={14} />}
                    onClick={handleStartReassignment}
                  >
                    Reasignar
                  </Button>
                )}
              </div>
            ) : (
              <div className='bg-muted/50 p-3 rounded-md text-sm'>
                <div className='text-center'>
                  <p className='text-muted-foreground mb-3'>
                    Aún no se ha asignado un técnico
                  </p>
                  {canAssignTechnician && !isAssigningTechnician && (
                    <Button
                      variant='primary'
                      size='sm'
                      leftIcon={<UserPlus size={14} />}
                      onClick={handleStartReassignment}
                    >
                      Asignar Técnico
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Modal de asignación - se muestra independientemente del estado del técnico */}
            {isAssigningTechnician && (
              <div className='bg-muted/50 p-3 rounded-md text-sm'>
                <div className='space-y-3'>
                  <p className='text-center text-muted-foreground mb-3'>
                    {currentTechnician
                      ? `Reasignar ticket de ${currentTechnician.name} a otro técnico`
                      : 'Seleccionar técnico para asignar'}
                  </p>
                  <select
                    className='w-full p-2 border border-border rounded-md bg-background'
                    value={selectedTechnicianId}
                    onChange={e => setSelectedTechnicianId(e.target.value)}
                  >
                    <option value=''>Seleccionar técnico...</option>
                    {availableTechnicians?.map(tech => (
                      <option
                        key={tech.id}
                        value={tech.id}
                        disabled={tech.id === currentTechnician?.id}
                      >
                        {tech.name} (
                        {tech.role === 'admin' ? 'Administrador' : 'Técnico'})
                        {tech.id === currentTechnician?.id ? ' (Actual)' : ''}
                      </option>
                    ))}
                  </select>
                  <div className='flex gap-2'>
                    <Button
                      variant='primary'
                      size='sm'
                      onClick={handleAssignTechnician}
                      disabled={
                        !selectedTechnicianId ||
                        selectedTechnicianId === currentTechnician?.id
                      }
                      className='flex-1'
                    >
                      {currentTechnician ? 'Reasignar' : 'Asignar'}
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleCancelAssignment}
                      className='flex-1'
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <TicketDetailsFooter
        status={status}
        canChangeStatus={!!canChangeStatus}
        isChangingStatus={isChangingStatus}
        onStartChat={onStartChat}
        onStartCall={onStartCall}
        onStatusChange={handleStatusChange}
        onOpenCloseModal={() => {
          setPendingStatus('closed');
          setShowObservationsModal(true);
        }}
      />

      <ObservationsModal
        show={showObservationsModal}
        pendingStatus={pendingStatus}
        technicalObservations={technicalObservations}
        onObservationsChange={setTechnicalObservations}
        onConfirm={handleConfirmStatusChange}
        onCancel={handleCancelStatusChange}
        isChangingStatus={isChangingStatus}
      />
    </Card>
  );
};
