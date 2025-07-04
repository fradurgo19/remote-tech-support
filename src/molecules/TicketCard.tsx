import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Avatar } from '../atoms/Avatar';
import { Ticket, User } from '../types';
import { Clock, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '../atoms/Button';

interface TicketCardProps {
  ticket: Ticket;
  customer?: User;
  technician?: User;
  onSelect: (ticketId: string) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ 
  ticket, 
  customer, 
  technician,
  onSelect
}) => {
  // Formatear la fecha de creación
  const formattedDate = new Date(ticket.createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

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
    <Card 
      variant="outline" 
      hoverEffect
      className="transition-all duration-200 ease-in-out"
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-semibold text-base leading-tight">{ticket.title}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={statusVariantMap[ticket.status]}
                className="capitalize"
              >
                {statusTranslations[ticket.status]}
              </Badge>
              <Badge 
                variant={priorityVariantMap[ticket.priority]}
                className="capitalize"
              >
                {priorityTranslations[ticket.priority]}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="text-sm space-y-3">
        <p className="text-muted-foreground line-clamp-2">{ticket.description}</p>
        
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock size={14} className="mr-1" />
          <span>{formattedDate}</span>
          <span className="mx-2">•</span>
          <MessageSquare size={14} className="mr-1" />
          <span>4 mensajes</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 border-t flex justify-between items-center">
        <div className="flex items-center">
          {customer && (
            <div className="flex items-center">
              <Avatar src={customer.avatar} size="sm" status={customer.status} />
              <span className="ml-2 text-sm font-medium">{customer.name}</span>
            </div>
          )}
          
          {technician && (
            <>
              <ArrowRight size={14} className="mx-2 text-muted-foreground" />
              <Avatar src={technician.avatar} size="sm" status={technician.status} />
            </>
          )}
        </div>
        
        <Button 
          size="sm"
          variant="ghost"
          className="text-primary"
          onClick={() => onSelect(ticket.id)}
        >
          Ver Detalles
        </Button>
      </CardFooter>
    </Card>
  );
};