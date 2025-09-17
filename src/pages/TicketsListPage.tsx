import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, User } from '../types';
import { ticketService, userService } from '../services/api';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { TicketCard } from '../molecules/TicketCard';
import { Spinner } from '../atoms/Spinner';
import { Badge } from '../atoms/Badge';
import { 
  Search, PlusCircle, AlertCircle, Filter,
  AlertTriangle
} from 'lucide-react';

export const TicketsListPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Ticket['status'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Ticket['priority'] | 'all'>('all');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Obtener tickets
        const ticketsData = await ticketService.getTickets();
        setTickets(ticketsData);
        
        // Obtener usuarios
        const usersData = await userService.getUsers();
        const usersMap = usersData.reduce<Record<string, User>>((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
        setUsers(usersMap);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar los tickets';
        setError(errorMessage);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  
  // Ordenar tickets por prioridad y luego por fecha de creación
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    // Primero ordenar por prioridad
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Luego ordenar por fecha (más recientes primero)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error al Cargar los Tickets</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Intentar de Nuevo</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Tickets de Soporte</h1>
        <Button
          leftIcon={<PlusCircle size={18} />}
          onClick={() => navigate('/tickets/new')}
        >
          Nuevo Ticket
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:max-w-md">
          <Input
            placeholder="Buscar tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center rounded-md border border-input bg-background px-3 h-10 text-sm">
            <Filter size={16} className="mr-2 text-muted-foreground" />
            <span className="text-muted-foreground mr-2">Estado:</span>
            <select
              className="bg-transparent border-none outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Todos</option>
              <option value="open">Abierto</option>
              <option value="in-progress">En Progreso</option>
              <option value="resolved">Resuelto</option>
              <option value="closed">Cerrado</option>
            </select>
          </div>
          
          <div className="inline-flex items-center rounded-md border border-input bg-background px-3 h-10 text-sm">
            <AlertTriangle size={16} className="mr-2 text-muted-foreground" />
            <span className="text-muted-foreground mr-2">Prioridad:</span>
            <select
              className="bg-transparent border-none outline-none"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
            >
              <option value="all">Todas</option>
              <option value="critical">Crítica</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>
        </div>
      </div>
      
      {sortedTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              customer={users[ticket.customerId]}
              technician={ticket.technicianId ? users[ticket.technicianId] : undefined}
              onSelect={() => navigate(`/tickets/${ticket.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-lg bg-muted/20">
          <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mb-4">
            <AlertCircle size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No se encontraron tickets</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
              ? 'Intenta ajustar tus filtros' 
              : 'Crea tu primer ticket de soporte para comenzar'}
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/tickets/new')}
          >
            Crear Ticket
          </Button>
        </div>
      )}
    </div>
  );
};