import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../molecules/ChatMessage';
import { Message, User, Ticket } from '../types';
import { useAuth } from '../context/AuthContext';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { messageService } from '../services/api';
import { socketService } from '../services/socket';
import { Paperclip, Send } from 'lucide-react';

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        setMessages(prev => [...prev, message]);
      }
    });
    
    return () => {
      // Salir de la sala del ticket cuando el componente se desmonte
      socketService.leaveTicketRoom(ticketId);
      unsubscribe();
    };
  }, [ticketId]);

  useEffect(() => {
    // Desplazarse hacia abajo cuando cambien los mensajes
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      
      await messageService.sendMessage(message);
      
      // También enviar a través del socket para actualizaciones en tiempo real
      socketService.sendMessage(message);
      
      setNewMessage('');
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
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
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Encabezado del chat */}
      <div className="bg-card border-b border-border p-3 flex items-center">
        <h3 className="text-lg font-semibold">
          {ticket?.title || 'Chat de Soporte'}
        </h3>
      </div>
      
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
      <form 
        onSubmit={handleSendMessage}
        className="border-t border-border p-3 bg-card"
      >
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Adjuntar archivo"
          >
            <Paperclip size={18} />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1"
          />
          
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            isLoading={isSending}
            aria-label="Enviar mensaje"
          >
            <Send size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
};