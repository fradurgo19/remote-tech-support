import {
  Calendar,
  CheckCircle,
  Clock,
  Forward,
  MessageSquare,
  Play,
  RefreshCw,
  Tag,
  UserPlus,
  Video,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { Avatar } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Card, CardContent, CardFooter, CardHeader } from '../atoms/Card';
import { Textarea } from '../atoms/Textarea';
import { Ticket, User } from '../types';

interface TicketDetailsProps {
  ticket: Ticket;
  customer?: User;
  technician?: User;
  currentUser?: User;
  availableTechnicians?: User[];
  onStartCall: () => void;
  onStartChat: () => void;
  onChangeStatus: (status: Ticket['status'], technicalObservations?: string) => void;
  onAssignTechnician?: (technicianId: string) => void;
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
}) => {
  const [isAssigningTechnician, setIsAssigningTechnician] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');
  const [showObservationsModal, setShowObservationsModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Ticket['status'] | null>(null);
  const [technicalObservations, setTechnicalObservations] = useState('');
  const [isChangingStatus, setIsChangingStatus] = useState(false);

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

  // Formatear fechas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  // Formatear ID del ticket para mostrar solo los primeros caracteres
  const formatTicketId = (ticketId: string) => {
    // Tomar los primeros 8 caracteres del UUID
    return ticketId.substring(0, 8).toUpperCase();
  };

  // Mapear estado a variante de badge
  const statusVariantMap: Record<
    Ticket['status'],
    'primary' | 'secondary' | 'success' | 'default'
  > = {
    open: 'primary',
    in_progress: 'secondary',
    resolved: 'success',
    closed: 'default',
    redirected: 'secondary',
  };

  // Mapear prioridad a variante de badge
  const priorityVariantMap: Record<
    Ticket['priority'],
    'primary' | 'secondary' | 'success' | 'default'
  > = {
    low: 'default',
    medium: 'secondary',
    high: 'primary',
    urgent: 'success',
  };

  // Traducir estados
  const statusTranslations: Record<Ticket['status'], string> = {
    open: 'abierto',
    in_progress: 'en progreso',
    resolved: 'resuelto',
    closed: 'cerrado',
    redirected: 'redireccionado',
  };

  // Traducir prioridades
  const priorityTranslations: Record<Ticket['priority'], string> = {
    low: 'baja',
    medium: 'media',
    high: 'alta',
    urgent: 'urgente',
  };

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
    
    if (canChangeStatus && (newStatus === 'in_progress' || newStatus === 'resolved' || newStatus === 'redirected')) {
      setPendingStatus(newStatus);
      setShowObservationsModal(true);
    } else {
      setIsChangingStatus(true);
      onChangeStatus(newStatus);
      setTimeout(() => setIsChangingStatus(false), 2000);
    }
  };

  // Función para confirmar cambio de estado con observaciones
  const handleConfirmStatusChange = async () => {
    if (pendingStatus && !isChangingStatus) {
      setIsChangingStatus(true);
      await onChangeStatus(pendingStatus, technicalObservations || undefined);
      setShowObservationsModal(false);
      setPendingStatus(null);
      setTechnicalObservations('');
      setTimeout(() => setIsChangingStatus(false), 2000);
    }
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
            <Badge variant={statusVariantMap[status]} className='capitalize'>
              {statusTranslations[status]}
            </Badge>
            <Badge
              variant={priorityVariantMap[priority]}
              className='capitalize'
            >
              {priorityTranslations[priority]}
            </Badge>
            <Badge>#{formatTicketId(id)}</Badge>
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
                        disabled={
                          currentTechnician && tech.id === currentTechnician.id
                        }
                      >
                        {tech.name} (
                        {tech.role === 'admin' ? 'Administrador' : 'Técnico'})
                        {currentTechnician && tech.id === currentTechnician.id
                          ? ' (Actual)'
                          : ''}
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
                        (currentTechnician &&
                          selectedTechnicianId === currentTechnician.id)
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

      <CardFooter className='border-t pt-4 flex flex-col sm:flex-row gap-2'>
        <Button
          variant='outline'
          leftIcon={<MessageSquare size={16} />}
          onClick={onStartChat}
          className='w-full sm:w-auto'
        >
          Chat
        </Button>

        <Button
          leftIcon={<Video size={16} />}
          onClick={onStartCall}
          className='w-full sm:w-auto'
        >
          Videollamada
        </Button>

        {/* Botón para cambiar a En Progreso - Solo para admin y técnicos */}
        {canChangeStatus && status === 'open' && (
          <Button
            variant='secondary'
            leftIcon={<Play size={16} />}
            onClick={() => handleStatusChange('in_progress')}
            disabled={isChangingStatus}
            className='w-full sm:w-auto'
          >
            {isChangingStatus ? 'Procesando...' : 'En Progreso'}
          </Button>
        )}

        {/* Botón Redireccionado - Solo para admin y técnicos */}
        {canChangeStatus && status !== 'resolved' && status !== 'closed' && status !== 'redirected' && (
          <Button
            variant='secondary'
            leftIcon={<Forward size={16} />}
            onClick={() => handleStatusChange('redirected')}
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
            onClick={() => handleStatusChange('resolved')}
            disabled={isChangingStatus}
            className='w-full sm:w-auto sm:ml-auto'
          >
            {isChangingStatus ? 'Procesando...' : 'Marcar como Resuelto'}
          </Button>
        )}

        {status !== 'closed' && status === 'resolved' && (
          <Button
            variant='outline'
            leftIcon={<XCircle size={16} />}
            onClick={() => handleStatusChange('closed')}
            disabled={isChangingStatus}
            className='w-full sm:w-auto sm:ml-auto'
          >
            {isChangingStatus ? 'Procesando...' : 'Cerrar Ticket'}
          </Button>
        )}
      </CardFooter>

      {/* Modal de Observaciones Técnicas */}
      {showObservationsModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-background rounded-lg p-6 w-full max-w-md mx-4 shadow-xl'>
            <h3 className='text-lg font-semibold mb-4'>
              Cambiar estado a: {pendingStatus && statusTranslations[pendingStatus]}
            </h3>
            <div className='mb-4'>
              <label className='block text-sm font-medium mb-2'>
                Observaciones Técnicas (opcional)
              </label>
              <Textarea
                value={technicalObservations}
                onChange={(e) => setTechnicalObservations(e.target.value)}
                placeholder='Ingrese observaciones técnicas sobre este cambio de estado...'
                rows={4}
                className='w-full'
              />
            </div>
            <div className='flex gap-2 justify-end'>
              <Button
                variant='outline'
                onClick={handleCancelStatusChange}
                disabled={isChangingStatus}
              >
                Cancelar
              </Button>
              <Button
                variant='primary'
                onClick={handleConfirmStatusChange}
                disabled={isChangingStatus}
              >
                {isChangingStatus ? 'Procesando...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
