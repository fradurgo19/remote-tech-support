import { io, Socket } from 'socket.io-client';
import { Message, User } from '../types';

// This would connect to your actual Socket.IO server in production
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private user: User | null = null;
  private isServerAvailable: boolean = true;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 3;
  private messageQueue: Message[] = [];
  private isReconnecting: boolean = false;
  private callRequestCallbacks: Array<(data: {
    from: string;
    fromName: string;
    fromEmail: string;
    fromAvatar?: string;
    ticketId: string;
    callSessionId: string;
  }) => void> = [];

  connect(user: User): void {
    this.user = user;

    // Reset connection attempts when explicitly connecting
    this.connectionAttempts = 0;

    try {
      // Get token from localStorage
      const token = localStorage.getItem('authToken');

      this.socket = io(SOCKET_URL, {
        auth: {
          token: token, // Send JWT token for authentication
        },
        timeout: 5000, // 5 second timeout
        forceNew: true,
        reconnection: true, // Enable reconnection
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    } catch (error) {
      console.warn('Socket.IO not available, running in offline mode');
      this.isServerAvailable = false;
      return;
    }

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isServerAvailable = true;
      this.connectionAttempts = 0;
      this.isReconnecting = false;

      // Expose socket to global context for debugging
      (window as any).socketService = this;
      (window as any).socket = this.socket;

      // Re-register call-request listeners when socket reconnects
      // This ensures listeners are active even if they were registered before connection
      if (this.callRequestCallbacks.length > 0) {
        console.log('📞 Re-registering call-request listeners after connect:', this.callRequestCallbacks.length);
        // Remove all existing listeners first to avoid duplicates
        this.socket.removeAllListeners('call-request');
        // Re-register all callbacks
        this.callRequestCallbacks.forEach(callback => {
          this.socket?.on('call-request', callback);
        });
      }

      // Resend any queued messages
      if (this.messageQueue.length > 0) {
        console.log('Resending queued messages:', this.messageQueue.length);
        this.messageQueue.forEach(message => {
          this.sendMessage(message);
        });
        this.messageQueue = [];
      }
    });

    this.socket.on('connect_error', error => {
      this.connectionAttempts++;
      // Only log the first attempt to avoid spam
      if (this.connectionAttempts === 1) {
        console.warn('Socket server not available, running in offline mode');
      }

      this.isServerAvailable = false;
      this.isReconnecting = false;
    });

    this.socket.on('disconnect', reason => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect automatically
        this.isServerAvailable = false;
      } else {
        // Client initiated disconnect or network issues, will try to reconnect
        this.isReconnecting = true;
      }
    });

    this.socket.on('reconnect_attempt', attemptNumber => {
      console.log('Attempting to reconnect:', attemptNumber);
      this.isReconnecting = true;
    });

    this.socket.on('reconnect', attemptNumber => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      this.isReconnecting = false;
      this.isServerAvailable = true;
      
      // Re-register call-request listeners after reconnection
      if (this.callRequestCallbacks.length > 0) {
        console.log('📞 Re-registering call-request listeners after reconnect:', this.callRequestCallbacks.length);
        // Remove all existing listeners first to avoid duplicates
        this.socket.removeAllListeners('call-request');
        // Re-register all callbacks
        this.callRequestCallbacks.forEach(callback => {
          this.socket?.on('call-request', callback);
        });
      }
    });

    this.socket.on('reconnect_error', error => {
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
      this.socket.emit('join_ticket', ticketId);
    }
  }

  leaveTicketRoom(ticketId: string): void {
    if (this.socket && this.isServerAvailable) {
      this.socket.emit('leave_ticket', ticketId);
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

  onUserStatusChange(
    callback: (data: { userId: string; status: User['status'] }) => void
  ): () => void {
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
    console.log('📞 SocketService: initiateCall called', {
      recipientId,
      ticketId,
      socket: !!this.socket,
      socketConnected: this.socket?.connected,
      user: !!this.user,
      serverAvailable: this.isServerAvailable,
    });

    if (this.socket && this.user && this.isServerAvailable) {
      this.socket.emit('call-initiate', {
        from: this.user.id,
        to: recipientId,
        ticketId,
      });
      console.log('✅ SocketService: call-initiate event emitted');
    } else {
      console.error(
        '❌ SocketService: Cannot initiate call - missing requirements'
      );
    }
  }

  onCallRequest(
    callback: (data: {
      from: string;
      fromName: string;
      fromEmail: string;
      fromAvatar?: string;
      ticketId: string;
      callSessionId: string;
    }) => void
  ): () => void {
    console.log('📞 SocketService: Setting up onCallRequest listener', {
      socket: !!this.socket,
      socketConnected: this.socket?.connected,
      serverAvailable: this.isServerAvailable,
    });

    const handleCallRequest = (data: any) => {
      console.log('📞 SocketService: Received call-request event:', data);
      callback(data);
    };

    // Store callback for re-registration on reconnect
    this.callRequestCallbacks.push(handleCallRequest);

    // Register listener if socket is already connected
    if (this.socket && this.socket.connected) {
      this.socket.on('call-request', handleCallRequest);
      console.log('📞 SocketService: Call-request listener registered (socket connected)');
    } else {
      console.log('📞 SocketService: Call-request listener queued (socket not connected yet)');
    }

    // Return cleanup function
    return () => {
      // Remove from callbacks array
      const index = this.callRequestCallbacks.indexOf(handleCallRequest);
      if (index > -1) {
        this.callRequestCallbacks.splice(index, 1);
      }
      // Remove listener from socket
      this.socket?.off('call-request', handleCallRequest);
    };
  }

  // WebRTC signaling
  sendSignal(to: string, signal: any): void {
    if (this.socket && this.isServerAvailable) {
      this.socket.emit('signal', { to, signal });
    } else {
      console.log('Mock: Signal sent', { to, signal });
    }
  }

  onSignal(
    callback: (data: { from: string; signal: any }) => void
  ): () => void {
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

  getSocket(): Socket | null {
    return this.socket;
  }

  reconnect(): void {
    if (this.user) {
      console.log('SocketService: Reconnecting...');
      this.disconnect();
      this.connect(this.user);
    }
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
