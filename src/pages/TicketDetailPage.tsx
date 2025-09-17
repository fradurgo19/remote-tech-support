import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, User } from '../types';
import { ticketService, userService } from '../services/api';
import { Spinner } from '../atoms/Spinner';
import { Button } from '../atoms/Button';
import { TicketDetails } from '../organisms/TicketDetails';
import { VideoCallPanel } from '../organisms/VideoCallPanel';
import { ChatPanel } from '../organisms/ChatPanel';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import { PermissionDenied } from '../components/PermissionDenied';

export const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'details' | 'chat' | 'call'>('details');
  
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
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar los detalles del ticket';
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [ticketId]);

  const handleChangeStatus = async (status: Ticket['status']) => {
    if (!ticket) return;
    
    try {
      const updatedTicket = await ticketService.updateTicket(ticket.id, { status });
      setTicket(updatedTicket);
    } catch (err) {
      console.error('Error al actualizar el estado del ticket:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !ticket) {
    // Verificar si es un error de permisos
    const isPermissionError = error && (error.includes('permisos') || error.includes('No tienes'));
    
    if (isPermissionError) {
      return (
        <PermissionDenied 
          message={error}
          onGoBack={() => navigate('/tickets')}
        />
      );
    }
    
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error al Cargar el Ticket</h2>
          <p className="text-muted-foreground mb-4">{error || 'Ticket no encontrado'}</p>
          <Button onClick={() => navigate('/tickets')}>Volver a Tickets</Button>
        </div>
      </div>
    );
  }

  const customer = users[ticket.customerId];
  const technician = ticket.technicianId ? users[ticket.technicianId] : undefined;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4" 
          leftIcon={<ChevronLeft size={16} />}
          onClick={() => navigate('/tickets')}
        >
          Volver a Tickets
        </Button>
        
        <div className="flex flex-wrap gap-3 mb-4">
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
      
      <div className="flex-1 overflow-hidden">
        {activeTab === 'details' && (
          <TicketDetails
            ticket={ticket}
            customer={customer}
            technician={technician}
            onStartCall={() => setActiveTab('call')}
            onStartChat={() => setActiveTab('chat')}
            onChangeStatus={handleChangeStatus}
          />
        )}
        
        {activeTab === 'chat' && (
          <div className="h-full border border-border rounded-lg overflow-hidden">
            <ChatPanel 
              ticketId={ticket.id}
              users={users}
              ticket={ticket}
            />
          </div>
        )}
        
        {activeTab === 'call' && (
          <VideoCallPanel
            recipientId={ticket.customerId}
            ticketId={ticket.id}
            localUser={users[ticket.technicianId || '']}
            remoteUsers={{ [ticket.customerId]: customer }}
          />
        )}
      </div>
    </div>
  );
};