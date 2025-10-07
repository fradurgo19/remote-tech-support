import { AlertCircle, Paperclip, Send, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { useAuth } from '../context/AuthContext';
import { ChatMessage } from '../molecules/ChatMessage';
import { messageService } from '../services/api';
import { socketService } from '../services/socket';
import { Message, Ticket, User } from '../types';

interface ChatPanelProps {
  ticketId: string;
  users: Record<string, User>;
  ticket?: Ticket;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  ticketId,
  users,
  ticket,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedMessages = await messageService.getMessagesByTicket(
          ticketId
        );
        // Ordenar mensajes por fecha/hora de creación (más antiguos primero)
        const sortedMessages = fetchedMessages.sort(
          (a, b) =>
            new Date(a.createdAt || a.timestamp).getTime() -
            new Date(b.createdAt || b.timestamp).getTime()
        );
        setMessages(sortedMessages);
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
    const unsubscribe = socketService.onReceiveMessage(message => {
      if (message.ticketId === ticketId) {
        setMessages(prev => {
          // Evitar duplicados
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          // Agregar nuevo mensaje y ordenar por fecha
          const updated = [...prev, message];
          return updated.sort(
            (a, b) =>
              new Date(a.createdAt || a.timestamp).getTime() -
              new Date(b.createdAt || b.timestamp).getTime()
          );
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
    // Usar un flag para evitar notificaciones en la conexión inicial
    let isInitialConnection = true;
    
    const handleConnect = () => {
      setIsConnected(true);
      // Solo mostrar notificación si no es la conexión inicial
      if (!isInitialConnection) {
        toast.success('Conexión restablecida');
      }
      isInitialConnection = false;
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      // Solo mostrar notificación si ya se había conectado antes
      if (!isInitialConnection) {
        toast.error('Conexión perdida. Intentando reconectar...');
      }
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
        chatContainerRef.current.scrollHeight -
          chatContainerRef.current.scrollTop <=
          chatContainerRef.current.clientHeight + 100;

      if (shouldAutoScroll) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || (!newMessage.trim() && !selectedFile)) {
      return;
    }

    setIsSending(true);

    try {
      if (selectedFile) {
        // Enviar archivo
        setIsUploading(true);
        const message = await messageService.sendFileMessage(
          ticketId,
          selectedFile
        );

        // Agregar mensaje a la lista local
        setMessages(prev => [...prev, message]);

        // Enviar a través del socket
        socketService.sendMessage(message);

        setSelectedFile(null);
        toast.success('Archivo enviado exitosamente');
      } else if (newMessage.trim()) {
        // Enviar mensaje de texto
        const receiverId =
          user.role === 'customer'
            ? ticket?.technicianId || ''
            : ticket?.customerId || '';

        const message: Omit<Message, 'id' | 'timestamp'> = {
          content: newMessage,
          senderId: user.id,
          receiverId,
          ticketId,
          type: 'text',
        };

        // Guardar en la base de datos
        const savedMessage = await messageService.sendMessage(message);

        // Agregar mensaje a la lista local inmediatamente
        setMessages(prev => [...prev, savedMessage]);

        // Enviar mensaje a través del socket para otros usuarios
        socketService.sendMessage(message);

        setNewMessage('');
      }
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      toast.error('Error al enviar el mensaje');
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileSelect called', e.target.files);
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño del archivo (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 10MB');
        e.target.value = ''; // Limpiar el input
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip',
        'application/x-rar-compressed',
      ];

      if (!allowedTypes.includes(file.type) && !file.type.startsWith('text/')) {
        toast.error('Tipo de archivo no permitido');
        e.target.value = ''; // Limpiar el input
        return;
      }

      setSelectedFile(file);
      toast.success(`Archivo seleccionado: ${file.name}`);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full p-6'>
        <p>Cargando mensajes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-full p-6'>
        <div className='text-center'>
          <AlertCircle className='w-12 h-12 text-destructive mx-auto mb-4' />
          <p className='text-destructive mb-2'>{error}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full'>
      {/* Encabezado del chat */}
      <div className='bg-card border-b border-border p-3 flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>
          {ticket?.title || 'Chat de Soporte'}
        </h3>
        {!isConnected && (
          <div className='flex items-center text-destructive text-sm'>
            <AlertCircle className='w-4 h-4 mr-1' />
            Reconectando...
          </div>
        )}
      </div>

      {/* Mensajes */}
      <div
        ref={chatContainerRef}
        className='flex-1 overflow-y-auto p-4 space-y-4'
      >
        {messages.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full text-center p-6'>
            <p className='text-muted-foreground mb-2'>Aún no hay mensajes</p>
            <p className='text-sm text-muted-foreground'>
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
      <form onSubmit={handleSendMessage} className='p-4 border-t border-border'>
        {/* Archivo seleccionado */}
        {selectedFile && (
          <div className='mb-3 p-3 bg-muted rounded-lg flex items-center justify-between border border-border'>
            <div className='flex items-center gap-2 flex-1 min-w-0'>
              <Paperclip className='h-4 w-4 text-primary flex-shrink-0' />
              <div className='flex-1 min-w-0'>
                <span className='text-sm font-medium truncate block'>
                  {selectedFile.name}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {selectedFile.size > 1024 * 1024
                    ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                    : `${Math.round(selectedFile.size / 1024)} KB`}
                </span>
              </div>
            </div>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={handleRemoveFile}
              className='h-6 w-6 hover:bg-destructive/10 hover:text-destructive flex-shrink-0'
              title='Eliminar archivo'
            >
              <X className='h-3 w-3' />
            </Button>
          </div>
        )}

        <div className='flex gap-2'>
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder='Escribe un mensaje...'
            disabled={isSending || !isConnected}
            className='flex-1'
          />

          {/* Botón para seleccionar archivo */}
          <Button
            type='button'
            variant='outline'
            size='icon'
            disabled={isSending || !isConnected || isUploading}
            className='h-10 w-10 hover:bg-primary/10'
            title='Adjuntar archivo'
            onClick={() => {
              console.log('Button clicked');
              document.getElementById('file-input')?.click();
            }}
          >
            <Paperclip className='h-4 w-4' />
          </Button>
          <input
            id='file-input'
            type='file'
            onChange={handleFileSelect}
            className='hidden'
            accept='image/*,application/pdf,text/*,.doc,.docx,.xls,.xlsx,.zip,.rar'
            multiple={false}
          />

          <Button
            type='submit'
            disabled={
              (!newMessage.trim() && !selectedFile) || isSending || !isConnected
            }
            size='icon'
          >
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </form>
    </div>
  );
};
