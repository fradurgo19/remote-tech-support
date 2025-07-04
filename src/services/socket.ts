import { io, Socket } from 'socket.io-client';
import { Message, User } from '../types';

// This would connect to your actual Socket.IO server in production
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private user: User | null = null;
  private isServerAvailable: boolean = true;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 3;
  private messageQueue: Message[] = [];
  private isReconnecting: boolean = false;

  connect(user: User): void {
    this.user = user;
    
    // Reset connection attempts when explicitly connecting
    this.connectionAttempts = 0;
    
    this.socket = io(SOCKET_URL, {
      auth: {
        userId: user.id,
        userRole: user.role,
      },
      timeout: 5000, // 5 second timeout
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isServerAvailable = true;
      this.connectionAttempts = 0;
      this.isReconnecting = false;
      
      // Resend any queued messages
      if (this.messageQueue.length > 0) {
        console.log('Resending queued messages:', this.messageQueue.length);
        this.messageQueue.forEach(message => {
          this.sendMessage(message);
        });
        this.messageQueue = [];
      }
    });

    this.socket.on('connect_error', (error) => {
      this.connectionAttempts++;
      console.warn(`Socket connection attempt ${this.connectionAttempts} failed:`, error.message);
      
      if (this.connectionAttempts >= this.maxConnectionAttempts) {
        console.warn('Socket server appears to be unavailable. Running in offline mode.');
        this.isServerAvailable = false;
        this.isReconnecting = true;
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect automatically
        this.isServerAvailable = false;
      } else {
        // Client initiated disconnect or network issues, will try to reconnect
        this.isReconnecting = true;
      }
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Attempting to reconnect:', attemptNumber);
      this.isReconnecting = true;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      this.isReconnecting = false;
      this.isServerAvailable = true;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect');
      this.isServerAvailable = false;
      this.isReconnecting = false;
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isServerAvailable = false;
    }
  }

  joinTicketRoom(ticketId: string): void {
    if (this.socket && this.isServerAvailable) {
      this.socket.emit('join-ticket', ticketId);
    }
  }

  leaveTicketRoom(ticketId: string): void {
    if (this.socket && this.isServerAvailable) {
      this.socket.emit('leave-ticket', ticketId);
    }
  }

  sendMessage(message: Omit<Message, 'id' | 'timestamp'>): void {
    if (this.socket && this.isServerAvailable) {
      this.socket.emit('send-message', message);
    } else {
      console.log('Message queued for later delivery:', message);
      // Queue the message for later delivery
      this.messageQueue.push(message as Message);
    }
  }

  onReceiveMessage(callback: (message: Message) => void): () => void {
    if (this.socket && this.isServerAvailable) {
      this.socket.on('receive-message', callback);
      return () => {
        this.socket?.off('receive-message', callback);
      };
    }
    return () => {};
  }

  onUserStatusChange(callback: (data: { userId: string; status: User['status'] }) => void): () => void {
    if (this.socket && this.isServerAvailable) {
      this.socket.on('user-status-change', callback);
      return () => {
        this.socket?.off('user-status-change', callback);
      };
    }
    return () => {};
  }

  onTicketUpdated(callback: (ticketId: string) => void): () => void {
    if (this.socket && this.isServerAvailable) {
      this.socket.on('ticket-updated', callback);
      return () => {
        this.socket?.off('ticket-updated', callback);
      };
    }
    return () => {};
  }

  // Handle call signaling
  initiateCall(recipientId: string, ticketId: string): void {
    if (this.socket && this.user && this.isServerAvailable) {
      this.socket.emit('call-initiate', {
        from: this.user.id,
        to: recipientId,
        ticketId,
      });
    } else {
      console.log('Mock: Call initiated', { recipientId, ticketId });
    }
  }

  onCallRequest(callback: (data: { from: string; ticketId: string }) => void): () => void {
    if (this.socket && this.isServerAvailable) {
      this.socket.on('call-request', callback);
      return () => {
        this.socket?.off('call-request', callback);
      };
    }
    return () => {};
  }

  // WebRTC signaling
  sendSignal(to: string, signal: any): void {
    if (this.socket && this.isServerAvailable) {
      this.socket.emit('signal', { to, signal });
    } else {
      console.log('Mock: Signal sent', { to, signal });
    }
  }

  onSignal(callback: (data: { from: string; signal: any }) => void): () => void {
    if (this.socket && this.isServerAvailable) {
      this.socket.on('signal', callback);
      return () => {
        this.socket?.off('signal', callback);
      };
    }
    return () => {};
  }

  isConnected(): boolean {
    return !!(this.socket?.connected && this.isServerAvailable);
  }

  isServerAvailableStatus(): boolean {
    return this.isServerAvailable;
  }

  public onConnectionChange(
    onConnect: () => void,
    onDisconnect: () => void
  ): () => void {
    this.socket?.on('connect', onConnect);
    this.socket?.on('disconnect', onDisconnect);

    return () => {
      this.socket?.off('connect', onConnect);
      this.socket?.off('disconnect', onDisconnect);
    };
  }
}

export const socketService = new SocketService();