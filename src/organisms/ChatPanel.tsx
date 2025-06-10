import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../molecules/ChatMessage';
import { Message, User, Ticket } from '../types';
import { useAuth } from '../context/AuthContext';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { messageService } from '../services/api';
import { socketService } from '../services/socket';
import { Paperclip, Send, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ChatPanelProps {
  ticketId: string;
  users: Record<string, User>;
  ticket?: Ticket;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ ticketId, users, ticket }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedMessages = await messageService.getMessagesByTicket(ticketId);
        setMessages(fetchedMessages);
      } catch (err) {
        setError('Error al cargar los mensajes');
        console.error(err);
        toast.error('Error al cargar los mensajes');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
    
    // Unirse a la sala del ticket
    socketService.joinTicketRoom(ticketId);
    
    // Suscribirse a nuevos mensajes
    const unsubscribe = socketService.onReceiveMessage((message) => {
      if (message.ticketId === ticketId) {
        setMessages(prev => {
          // Evitar duplicados
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
        
        // Mostrar notificación si el mensaje no es propio
        if (message.senderId !== user?.id) {
          toast.success('Nuevo mensaje recibido', {
            icon: '💬',
          });
        }
      }
    });
    
    // Suscribirse a cambios de estado de conexión
    const handleConnect = () => {
      setIsConnected(true);
      toast.success('Conexión restablecida');
    };
    
    const handleDisconnect = () => {
      setIsConnected(false);
      toast.error('Conexión perdida. Intentando reconectar...');
    };
    
    socketService.onConnectionChange(handleConnect, handleDisconnect);
    
    return () => {
      // Salir de la sala del ticket cuando el componente se desmonte
      socketService.leaveTicketRoom(ticketId);
      unsubscribe();
    };
  }, [ticketId, user?.id]);

  useEffect(() => {
    // Desplazarse hacia abajo cuando cambien los mensajes
    if (messagesEndRef.current) {
      const shouldAutoScroll = 
        chatContainerRef.current && 
        chatContainerRef.current.scrollHeight - chatContainerRef.current.scrollTop <= chatContainerRef.current.clientHeight + 100;
      
      if (shouldAutoScroll) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newMessage.trim()) {
      return;
    }
    
    setIsSending(true);
    
    try {
      // Asumiendo que estamos chateando con el técnico o el cliente
      const receiverId = user.role === 'customer' 
        ? ticket?.technicianId || ''
        : ticket?.customerId || '';
      
      const message: Omit<Message, 'id' | 'timestamp'> = {
        content: newMessage,
        senderId: user.id,
        receiverId,
        ticketId,
        type: 'text',
      };
      
      // Enviar mensaje a través del socket para actualización en tiempo real
      socketService.sendMessage(message);
      
      // También guardar en la base de datos
      await messageService.sendMessage(message);
      
      setNewMessage('');
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      toast.error('Error al enviar el mensaje');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p>Cargando mensajes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-2">{error}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Encabezado del chat */}
      <div className="bg-card border-b border-border p-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {ticket?.title || 'Chat de Soporte'}
        </h3>
        {!isConnected && (
          <div className="flex items-center text-destructive text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            Reconectando...
          </div>
        )}
      </div>
      
      {/* Mensajes */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <p className="text-muted-foreground mb-2">Aún no hay mensajes</p>
            <p className="text-sm text-muted-foreground">
              Inicia la conversación enviando un mensaje
            </p>
          </div>
        ) : (
          messages.map(message => {
            const isOwn = message.senderId === user?.id;
            return (
              <ChatMessage
                key={message.id}
                message={message}
                sender={users[message.senderId]}
                isOwn={isOwn}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Entrada de mensaje */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={isSending || !isConnected}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending || !isConnected}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};