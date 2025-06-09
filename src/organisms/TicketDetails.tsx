import React from 'react';
import { Ticket, User } from '../types';
import { Badge } from '../atoms/Badge';
import { Avatar } from '../atoms/Avatar';
import { Button } from '../atoms/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../atoms/Card';
import { 
  Clock, AlertTriangle, Tag, Calendar, MessageSquare, 
  Video, PhoneCall, CheckCircle, XCircle
} from 'lucide-react';

interface TicketDetailsProps {
  ticket: Ticket;
  customer?: User;
  technician?: User;
  onStartCall: () => void;
  onStartChat: () => void;
  onChangeStatus: (status: Ticket['status']) => void;
}

export const TicketDetails: React.FC<TicketDetailsProps> = ({
  ticket,
  customer,
  technician,
  onStartCall,
  onStartChat,
  onChangeStatus,
}) => {
  const {
    id,
    title,
    description,
    status,
    priority,
    createdAt,
    updatedAt,
    category,
    tags,
  } = ticket;

  // Formatear fechas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  // Mapear estado a variante de badge
  const statusVariantMap: Record<Ticket['status'], any> = {
    'open': 'primary',
    'in-progress': 'warning',
    'resolved': 'success',
    'closed': 'default'
  };

  // Mapear prioridad a variante de badge
  const priorityVariantMap: Record<Ticket['priority'], any> = {
    'low': 'default',
    'medium': 'secondary',
    'high': 'warning',
    'critical': 'danger'
  };

  // Traducir estados
  const statusTranslations: Record<Ticket['status'], string> = {
    'open': 'abierto',
    'in-progress': 'en progreso',
    'resolved': 'resuelto',
    'closed': 'cerrado'
  };

  // Traducir prioridades
  const priorityTranslations: Record<Ticket['priority'], string> = {
    'low': 'baja',
    'medium': 'media',
    'high': 'alta',
    'critical': 'crítica'
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex flex-col space-y-3">
          <div className="flex flex-wrap gap-2 mb-1">
            <Badge 
              variant={statusVariantMap[status]}
              className="capitalize"
            >
              {statusTranslations[status]}
            </Badge>
            <Badge 
              variant={priorityVariantMap[priority]}
              className="capitalize"
            >
              {priorityTranslations[priority]}
            </Badge>
            <Badge>#{id}</Badge>
          </div>
          
          <h2 className="text-xl font-bold">{title}</h2>
          
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="flex items-center gap-1"
              >
                <Tag size={12} />
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground pt-1">
            <div className="flex items-center">
              <Calendar size={16} className="mr-1.5" />
              <span>Creado: {formatDate(createdAt)}</span>
            </div>
            
            <div className="flex items-center">
              <Clock size={16} className="mr-1.5" />
              <span>Actualizado: {formatDate(updatedAt)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-medium mb-2">Descripción</h3>
            <div className="bg-muted/50 p-3 rounded-md text-sm">{description}</div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-base font-medium">Personas</h3>
            
            <div className="flex items-center justify-between bg-card border border-border p-3 rounded-md">
              <div className="flex items-center">
                <Avatar src={customer?.avatar} status={customer?.status} />
                <div className="ml-3">
                  <p className="font-medium">{customer?.name || 'Cliente Desconocido'}</p>
                  <p className="text-xs text-muted-foreground">Cliente</p>
                </div>
              </div>
            </div>
            
            {technician ? (
              <div className="flex items-center justify-between bg-card border border-border p-3 rounded-md">
                <div className="flex items-center">
                  <Avatar src={technician.avatar} status={technician.status} />
                  <div className="ml-3">
                    <p className="font-medium">{technician.name}</p>
                    <p className="text-xs text-muted-foreground">Técnico de Soporte</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-muted/50 p-3 rounded-md text-sm text-center text-muted-foreground">
                Aún no se ha asignado un técnico
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex flex-col sm:flex-row gap-2">
        <Button 
          variant="outline" 
          leftIcon={<MessageSquare size={16} />}
          onClick={onStartChat}
          className="w-full sm:w-auto"
        >
          Chat
        </Button>
        
        <Button 
          leftIcon={<Video size={16} />}
          onClick={onStartCall}
          className="w-full sm:w-auto"
        >
          Videollamada
        </Button>
        
        {status !== 'resolved' && (
          <Button 
            variant="success"
            leftIcon={<CheckCircle size={16} />}
            onClick={() => onChangeStatus('resolved')}
            className="w-full sm:w-auto sm:ml-auto"
          >
            Marcar como Resuelto
          </Button>
        )}
        
        {status !== 'closed' && status === 'resolved' && (
          <Button 
            variant="outline"
            leftIcon={<XCircle size={16} />}
            onClick={() => onChangeStatus('closed')}
            className="w-full sm:w-auto sm:ml-auto"
          >
            Cerrar Ticket
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};