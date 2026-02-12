import {
  BarChart3,
  Filter,
  Package,
  Tag,
  TrendingUp,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../atoms/Card';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Spinner } from '../atoms/Spinner';
import { useAuth } from '../context/AuthContext';
import { ticketService, type TicketKpisResponse } from '../services/api';

const MARCAS = ['Case', 'Dynapac', 'Hitachi', 'Liugong', 'Okada', 'Yanmar'];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'open', label: 'Abierto' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'redirected', label: 'Redireccionado' },
  { value: 'resolved', label: 'Resuelto' },
  { value: 'closed', label: 'Cerrado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const STATUS_LABELS: Record<string, string> = {
  open: 'Abierto',
  in_progress: 'En progreso',
  redirected: 'Redireccionado',
  resolved: 'Resuelto',
  closed: 'Cerrado',
  cancelled: 'Cancelado',
  sin_estado: 'Sin estado',
};

export const KPIPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [marca, setMarca] = useState('');
  const [modeloEquipo, setModeloEquipo] = useState('');
  const [status, setStatus] = useState('all');
  const [kpis, setKpis] = useState<TicketKpisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'customer') {
      navigate('/', { replace: true });
    }
  }, [user?.role, navigate]);

  useEffect(() => {
    if (user?.role === 'customer') return;

    const fetchKpis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params: Parameters<typeof ticketService.getTicketKpis>[0] = {};
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;
        if (marca) params.marca = marca;
        if (modeloEquipo.trim()) params.modeloEquipo = modeloEquipo.trim();
        if (status !== 'all') params.status = status;
        const data = await ticketService.getTicketKpis(params);
        setKpis(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al cargar indicadores'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchKpis();
  }, [user?.role, dateFrom, dateTo, marca, modeloEquipo, status]);

  const handleApplyFilters = () => {
    // Re-fetch is triggered by useEffect when state changes; this can be used for explicit "Aplicar" if we switch to button-driven fetch later.
  };

  if (user?.role === 'customer') {
    return null;
  }

  if (isLoading && !kpis) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Spinner size='lg' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>Indicadores KPI</h1>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Filter size={18} className='mr-2' />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            <div className='space-y-2'>
              <label htmlFor='kpi-dateFrom' className='text-sm font-medium'>
                Fecha desde
              </label>
              <Input
                id='kpi-dateFrom'
                type='date'
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <label htmlFor='kpi-dateTo' className='text-sm font-medium'>
                Fecha hasta
              </label>
              <Input
                id='kpi-dateTo'
                type='date'
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <label htmlFor='kpi-marca' className='text-sm font-medium'>
                Marca
              </label>
              <Select
                id='kpi-marca'
                value={marca}
                onChange={e => setMarca(e.target.value)}
              >
                <option value=''>Todas</option>
                {MARCAS.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
            <div className='space-y-2'>
              <label htmlFor='kpi-modelo' className='text-sm font-medium'>
                Modelo
              </label>
              <Input
                id='kpi-modelo'
                type='text'
                value={modeloEquipo}
                onChange={e => setModeloEquipo(e.target.value)}
                placeholder='Filtrar por modelo'
              />
            </div>
            <div className='space-y-2'>
              <label htmlFor='kpi-status' className='text-sm font-medium'>
                Estado
              </label>
              <Select
                id='kpi-status'
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <Button type='button' onClick={handleApplyFilters} variant='outline'>
            Aplicar filtros
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className='border-destructive'>
          <CardContent className='p-4 text-destructive'>{error}</CardContent>
        </Card>
      )}

      {kpis && (
        <>
          {/* Total */}
          <Card>
            <CardContent className='p-6 flex items-center space-x-4'>
              <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center'>
                <TrendingUp className='h-6 w-6 text-primary' />
              </div>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Total de tickets
                </p>
                <h3 className='text-3xl font-bold'>{kpis.total}</h3>
              </div>
            </CardContent>
          </Card>

          {/* Por estado */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <BarChart3 size={18} className='mr-2' />
                Por estado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {Object.entries(kpis.byStatus)
                  .sort(([, a], [, b]) => b - a)
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className='flex items-center justify-between p-3 rounded-md bg-muted/50'
                    >
                      <span className='text-sm font-medium'>
                        {STATUS_LABELS[key] ?? key}
                      </span>
                      <span className='text-lg font-bold'>{value}</span>
                    </div>
                  ))}
              </div>
              {Object.keys(kpis.byStatus).length === 0 && (
                <p className='text-sm text-muted-foreground'>
                  No hay datos por estado con los filtros aplicados.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Por marca */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Tag size={18} className='mr-2' />
                Por marca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {Object.entries(kpis.byMarca)
                  .sort(([, a], [, b]) => b - a)
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className='flex items-center justify-between p-3 rounded-md bg-muted/50'
                    >
                      <span className='text-sm font-medium'>{key}</span>
                      <span className='text-lg font-bold'>{value}</span>
                    </div>
                  ))}
              </div>
              {Object.keys(kpis.byMarca).length === 0 && (
                <p className='text-sm text-muted-foreground'>
                  No hay datos por marca con los filtros aplicados.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Por modelo */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Package size={18} className='mr-2' />
                Por modelo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {Object.entries(kpis.byModelo)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 24)
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className='flex items-center justify-between p-3 rounded-md bg-muted/50'
                    >
                      <span className='text-sm font-medium truncate max-w-[180px]'>
                        {key}
                      </span>
                      <span className='text-lg font-bold shrink-0 ml-2'>
                        {value}
                      </span>
                    </div>
                  ))}
              </div>
              {Object.keys(kpis.byModelo).length === 0 && (
                <p className='text-sm text-muted-foreground'>
                  No hay datos por modelo con los filtros aplicados.
                </p>
              )}
              {Object.keys(kpis.byModelo).length > 24 && (
                <p className='text-xs text-muted-foreground mt-2'>
                  Mostrando los 24 modelos con más tickets.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
