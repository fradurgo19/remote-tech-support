import { AlertCircle, ChevronLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { Spinner } from '../atoms/Spinner';
import { PermissionDenied } from '../components/PermissionDenied';
import { useAuth } from '../context/AuthContext';
import { useUserStatus } from '../hooks/useUserStatus';
import { ChatPanel } from '../organisms/ChatPanel';
import { TicketDetails } from '../organisms/TicketDetails';
import { VideoCallPanel } from '../organisms/VideoCallPanel';
import { ticketService, userService } from '../services/api';
import { Ticket, User } from '../types';

export const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'details' | 'chat' | 'call'>(
    'details'
  );

  // Hook para estado de usuarios en tiempo real
  const { getUserWithStatus } = useUserStatus(users);

  // Obtener técnicos disponibles (admin y technician)
  const availableTechnicians = Object.values(users).filter(
    user => user.role === 'admin' || user.role === 'technician'
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!ticketId) return;

      setLoading(true);
      setError(null);

      try {
        // Obtener detalles del ticket
        const fetchedTicket = await ticketService.getTicketById(ticketId);
        setTicket(fetchedTicket);

        // Obtener usuarios (cliente y técnico)
        const usersData = await userService.getUsers();
        const usersMap = usersData.reduce<Record<string, User>>((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
        setUsers(usersMap);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Error al cargar los detalles del ticket';
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticketId]);

  const handleChangeStatus = async (
    status: Ticket['status'],
    technicalObservations?: string
  ) => {
    if (!ticket) return;

    try {
      const updateData: {
        status: Ticket['status'];
        technicalObservations?: string;
      } = { status };
      if (technicalObservations) {
        updateData.technicalObservations = technicalObservations;
      }
      const updatedTicket = await ticketService.updateTicket(
        ticket.id,
        updateData
      );
      setTicket(updatedTicket);
    } catch (err) {
      console.error('Error al actualizar el estado del ticket:', err);
    }
  };

  const handleAssignTechnician = async (technicianId: string) => {
    if (!ticket) return;

    try {
      const updatedTicket = await ticketService.updateTicket(ticket.id, {
        technicianId,
      });
      setTicket(updatedTicket);
    } catch (err) {
      console.error('Error al asignar técnico:', err);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Spinner size='lg' />
      </div>
    );
  }

  if (error || !ticket) {
    // Verificar si es un error de permisos
    const isPermissionError =
      error && (error.includes('permisos') || error.includes('No tienes'));

    if (isPermissionError) {
      return (
        <PermissionDenied
          message={error}
          onGoBack={() => navigate('/tickets')}
        />
      );
    }

    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-center'>
          <AlertCircle size={48} className='text-destructive mx-auto mb-4' />
          <h2 className='text-xl font-semibold mb-2'>
            Error al Cargar el Ticket
          </h2>
          <p className='text-muted-foreground mb-4'>
            {error || 'Ticket no encontrado'}
          </p>
          <Button onClick={() => navigate('/tickets')}>Volver a Tickets</Button>
        </div>
      </div>
    );
  }

  // Si el usuario actual es el cliente, usar currentUser como fallback
  // Aplicar estado de conexión en tiempo real
  const customerBase =
    users[ticket.customerId] ||
    (currentUser?.id === ticket.customerId ? currentUser : undefined);
  const customer = getUserWithStatus(customerBase);

  const technicianBase = ticket.technicianId
    ? users[ticket.technicianId]
    : undefined;
  const technician = getUserWithStatus(technicianBase);

  return (
    <div className='h-full flex flex-col'>
      <div className='mb-6'>
        <Button
          variant='ghost'
          className='mb-4'
          leftIcon={<ChevronLeft size={16} />}
          onClick={() => navigate('/tickets')}
        >
          Volver a Tickets
        </Button>

        <div className='flex flex-wrap gap-3 mb-4'>
          <Button
            variant={activeTab === 'details' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('details')}
          >
            Detalles del Ticket
          </Button>
          <Button
            variant={activeTab === 'chat' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </Button>
          <Button
            variant={activeTab === 'call' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('call')}
          >
            Videollamada
          </Button>
        </div>
      </div>

      <div className='flex-1 overflow-hidden'>
        {activeTab === 'details' && (
          <TicketDetails
            ticket={ticket}
            customer={customer}
            technician={technician}
            currentUser={currentUser}
            availableTechnicians={availableTechnicians}
            onStartCall={() => setActiveTab('call')}
            onStartChat={() => setActiveTab('chat')}
            onChangeStatus={handleChangeStatus}
            onAssignTechnician={handleAssignTechnician}
          />
        )}

        {activeTab === 'chat' && (
          <div className='h-full border border-border rounded-lg overflow-hidden'>
            <ChatPanel ticketId={ticket.id} users={users} ticket={ticket} />
          </div>
        )}

        {activeTab === 'call' && (
          <VideoCallPanel
            recipientId={
              currentUser?.id === ticket.customerId
                ? ticket.technicianId || ''
                : ticket.customerId
            }
            ticketId={ticket.id}
            localUser={currentUser}
            remoteUsers={{
              [ticket.customerId]: customer,
              ...(technician && { [ticket.technicianId]: technician }),
            }}
          />
        )}
      </div>
    </div>
  );
};
