import {
  AlertCircle,
  AlertTriangle,
  Filter,
  PackageSearch,
  PlusCircle,
  Search,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Spinner } from '../atoms/Spinner';
import { TicketCard } from '../molecules/TicketCard';
import { useAuth } from '../context/AuthContext';
import {
  purchasesService,
  PurchasesSearchResponse,
  ticketService,
  userService,
} from '../services/api';
import { Ticket, User } from '../types';

export const TicketsListPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Ticket['status'] | 'all'>(
    'all'
  );
  const [priorityFilter, setPriorityFilter] = useState<
    Ticket['priority'] | 'all'
  >('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');

  const [purchasesQuery, setPurchasesQuery] = useState('');
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [purchasesResult, setPurchasesResult] =
    useState<PurchasesSearchResponse | null>(null);
  const [purchasesError, setPurchasesError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();
  const isTechnicianOrAdmin =
    user?.role === 'admin' || user?.role === 'technician';

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
        
        // Filtrar solo clientes para el filtro
        const customersList = usersData.filter(u => u.role === 'customer');
        setCustomers(customersList);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al cargar los tickets';
        setError(errorMessage);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Obtener lista de técnicos únicos que tienen tickets asignados
  const techniciansWithTickets = Array.from(
    new Set(tickets.filter(t => t.technicianId).map(t => t.technicianId))
  )
    .map(techId => users[techId!])
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesCustomer =
      customerFilter === 'all' || ticket.customerId === customerFilter;

    let matchesTechnician: boolean;
    if (technicianFilter === 'all') {
      matchesTechnician = true;
    } else if (technicianFilter === 'unassigned') {
      matchesTechnician = !ticket.technicianId;
    } else {
      matchesTechnician = ticket.technicianId === technicianFilter;
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesCustomer && matchesTechnician;
  });

  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };

  const handleSearchPurchases = async () => {
    const q = purchasesQuery.trim();
    if (!q) return;
    setPurchasesLoading(true);
    setPurchasesError(null);
    setPurchasesResult(null);
    try {
      const data = await purchasesService.searchByNitOrName({
        nit: q,
        name: q,
      });
      setPurchasesResult(data);
    } catch (err) {
      setPurchasesError(
        err instanceof Error ? err.message : 'Error al buscar compras'
      );
    } finally {
      setPurchasesLoading(false);
    }
  };

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
            Error al Cargar los Tickets
          </h2>
          <p className='text-muted-foreground mb-4'>{error}</p>
          <Button onClick={() => globalThis.location.reload()}>
            Intentar de Nuevo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-2xl font-bold'>Tickets de Soporte</h1>
        <Button
          leftIcon={<PlusCircle size={18} />}
          onClick={() => navigate('/tickets/new')}
        >
          Nuevo Ticket
        </Button>
      </div>

      <div className='flex flex-col md:flex-row gap-4'>
        <div className='w-full md:max-w-md'>
          <Input
            placeholder='Buscar tickets...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>

        <div className='flex flex-wrap gap-2'>
          <div className='inline-flex items-center rounded-md border border-input bg-background px-3 h-10 text-sm'>
            <Filter size={16} className='mr-2 text-muted-foreground' />
            <span className='text-muted-foreground mr-2'>Estado:</span>
            <select
              className='bg-transparent border-none outline-none'
              value={statusFilter}
              onChange={e =>
                setStatusFilter(e.target.value as Ticket['status'] | 'all')
              }
            >
              <option value='all'>Todos</option>
              <option value='open'>Abierto</option>
              <option value='in_progress'>En Progreso</option>
              <option value='redirected'>Redireccionado</option>
              <option value='resolved'>Resuelto</option>
              <option value='closed'>Cerrado</option>
            </select>
          </div>

          <div className='inline-flex items-center rounded-md border border-input bg-background px-3 h-10 text-sm'>
            <AlertTriangle size={16} className='mr-2 text-muted-foreground' />
            <span className='text-muted-foreground mr-2'>Prioridad:</span>
            <select
              className='bg-transparent border-none outline-none'
              value={priorityFilter}
              onChange={e =>
                setPriorityFilter(e.target.value as Ticket['priority'] | 'all')
              }
            >
              <option value='all'>Todas</option>
              <option value='urgent'>Urgente</option>
              <option value='high'>Alta</option>
              <option value='medium'>Media</option>
              <option value='low'>Baja</option>
            </select>
          </div>

          {customers.length > 0 && (
            <div className='inline-flex items-center rounded-md border border-input bg-background px-3 h-10 text-sm'>
              <Users size={16} className='mr-2 text-muted-foreground' />
              <span className='text-muted-foreground mr-2'>Cliente:</span>
              <select
                className='bg-transparent border-none outline-none max-w-[200px]'
                value={customerFilter}
                onChange={e => setCustomerFilter(e.target.value)}
              >
                <option value='all'>Todos</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className='inline-flex items-center rounded-md border border-input bg-background px-3 h-10 text-sm'>
            <Users size={16} className='mr-2 text-muted-foreground' />
            <span className='text-muted-foreground mr-2'>Técnico:</span>
            <select
              className='bg-transparent border-none outline-none max-w-[200px]'
              value={technicianFilter}
              onChange={e => setTechnicianFilter(e.target.value)}
            >
              <option value='all'>Todos</option>
              <option value='unassigned'>Sin Asignar</option>
              {techniciansWithTickets.map(tech => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isTechnicianOrAdmin && (
        <div className='flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4'>
          <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
            <label
              htmlFor='purchases-search'
              className='text-sm font-medium flex items-center gap-2'
            >
              <PackageSearch size={18} className='text-muted-foreground' />
              Compras por NIT o Nombre
            </label>
            <div className='flex flex-1 flex-col sm:flex-row gap-2 max-w-md'>
              <Input
                id='purchases-search'
                placeholder='NIT o nombre del cliente...'
                value={purchasesQuery}
                onChange={e => {
                  setPurchasesQuery(e.target.value);
                  setPurchasesError(null);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSearchPurchases();
                }}
              />
              <Button
                variant='outline'
                onClick={handleSearchPurchases}
                disabled={purchasesLoading || !purchasesQuery.trim()}
              >
                {purchasesLoading ? (
                  <Spinner size='sm' />
                ) : (
                  'Buscar compras'
                )}
              </Button>
            </div>
          </div>
          {purchasesError && (
            <p className='text-sm text-destructive'>{purchasesError}</p>
          )}
          {purchasesResult && !purchasesError && (
            <div className='mt-2 rounded-md border border-border bg-background p-3 text-sm'>
              {purchasesResult.client ? (
                <>
                  <p className='font-medium mb-2'>
                    {purchasesResult.client.cardName}
                    {purchasesResult.client.federalTaxId && (
                      <span className='text-muted-foreground font-normal ml-2'>
                        NIT: {purchasesResult.client.federalTaxId}
                      </span>
                    )}
                  </p>
                  {purchasesResult.purchases.length > 0 ? (
                    <div className='overflow-x-auto'>
                      <table className='w-full text-left border-collapse'>
                        <thead>
                          <tr className='border-b border-border'>
                            <th className='py-1.5 pr-2'>Doc</th>
                            <th className='py-1.5 pr-2'>Fecha</th>
                            <th className='py-1.5 pr-2'>Venc.</th>
                            <th className='py-1.5 pr-2 text-right'>Total</th>
                            <th className='py-1.5'>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchasesResult.purchases.map((p, i) => (
                            <tr
                              key={p.docEntry ?? i}
                              className='border-b border-border/50'
                            >
                              <td className='py-1.5 pr-2'>
                                {p.docNum ?? p.docEntry ?? '-'}
                              </td>
                              <td className='py-1.5 pr-2'>
                                {p.docDate
                                  ? new Date(p.docDate).toLocaleDateString()
                                  : '-'}
                              </td>
                              <td className='py-1.5 pr-2'>
                                {p.docDueDate
                                  ? new Date(
                                      p.docDueDate
                                    ).toLocaleDateString()
                                  : '-'}
                              </td>
                              <td className='py-1.5 pr-2 text-right'>
                                {p.docTotal == null
                                  ? '-'
                                  : Number(p.docTotal).toLocaleString()}
                              </td>
                              <td className='py-1.5'>
                                {p.docStatus ?? '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className='text-muted-foreground'>
                      No hay compras recientes para este cliente.
                    </p>
                  )}
                </>
              ) : (
                <p className='text-muted-foreground'>
                  {purchasesResult.message ??
                    'No se encontraron clientes con ese NIT o nombre.'}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {sortedTickets.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {sortedTickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              customer={users[ticket.customerId]}
              technician={
                ticket.technicianId ? users[ticket.technicianId] : undefined
              }
              onSelect={() => navigate(`/tickets/${ticket.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-lg bg-muted/20'>
          <div className='bg-muted h-16 w-16 rounded-full flex items-center justify-center mb-4'>
            <AlertCircle size={24} className='text-muted-foreground' />
          </div>
          <h3 className='text-lg font-medium mb-2'>
            No se encontraron tickets
          </h3>
          <p className='text-muted-foreground text-sm mb-4'>
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || customerFilter !== 'all'
              ? 'Intenta ajustar tus filtros'
              : 'Crea tu primer ticket de soporte para comenzar'}
          </p>
          <Button variant='outline' onClick={() => navigate('/tickets/new')}>
            Crear Ticket
          </Button>
        </div>
      )}
    </div>
  );
};
