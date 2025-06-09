import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, User, ServiceCategory } from '../types';
import { TicketCard } from '../molecules/TicketCard';
import { ServiceCatalog } from '../organisms/ServiceCatalog';
import { Card, CardHeader, CardTitle, CardContent } from '../atoms/Card';
import { Spinner } from '../atoms/Spinner';
import { Button } from '../atoms/Button';
import { ticketService, userService, categoryService } from '../services/api';
import {
  PlusCircle,
  BarChart3,
  UsersRound,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        
        // Obtener categorías de servicio
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        setError('Error al cargar los datos del panel');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const criticalTickets = tickets.filter(t => t.priority === 'critical').length;

  const statusMetrics = [
    { label: 'Abiertos', value: openTickets, icon: <Clock className="text-primary" /> },
    { label: 'En Progreso', value: inProgressTickets, icon: <BarChart3 className="text-warning" /> },
    { label: 'Resueltos', value: resolvedTickets, icon: <CheckCircle2 className="text-success" /> },
    { label: 'Críticos', value: criticalTickets, icon: <AlertCircle className="text-destructive" /> },
  ];

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
          <h2 className="text-xl font-semibold mb-2">Error al Cargar el Panel</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Intentar de Nuevo</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Panel Principal</h1>
        <Button
          leftIcon={<PlusCircle size={18} />}
          onClick={() => navigate('/tickets/new')}
        >
          Nuevo Ticket
        </Button>
      </div>
      
      {/* Tarjetas de estado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center">
                {metric.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <h3 className="text-2xl font-bold">{metric.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Técnicos activos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UsersRound size={18} className="mr-2" />
            Técnicos Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {Object.values(users)
              .filter(user => user.role === 'technician')
              .map(tech => (
                <div key={tech.id} className="flex flex-col items-center space-y-2 min-w-[80px]">
                  <div className="relative">
                    <img
                      src={tech.avatar}
                      alt={tech.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <span 
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white
                        ${tech.status === 'online' ? 'bg-success' : 
                          tech.status === 'away' ? 'bg-warning' : 
                          tech.status === 'busy' ? 'bg-destructive' : 'bg-muted-foreground'}`}
                    />
                  </div>
                  <span className="text-sm font-medium truncate max-w-full">{tech.name}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Tickets recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock size={18} className="mr-2" />
            Tickets de Soporte Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickets
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 3)
                .map(ticket => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    customer={users[ticket.customerId]}
                    technician={ticket.technicianId ? users[ticket.technicianId] : undefined}
                    onSelect={() => navigate(`/tickets/${ticket.id}`)}
                  />
                ))
              }
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron tickets</p>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/tickets')}
            >
              Ver Todos los Tickets
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Catálogo de servicios */}
      <Card>
        <CardHeader>
          <CardTitle>Servicios de Soporte</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceCatalog 
            categories={categories}
            onSelectCategory={(categoryId) => {
              navigate(`/support?category=${categoryId}`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};