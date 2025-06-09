import { User, Ticket, Message, CallSession, ServiceCategory } from '../types';

// Servicio de API simulado - En una aplicación real, esto haría llamadas API reales
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Datos de ejemplo
const users: User[] = [
  {
    id: '1',
    name: 'Juan Técnico',
    email: 'juan@soportetecnico.com',
    role: 'technician',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    status: 'online',
  },
  {
    id: '2',
    name: 'Sara Admin',
    email: 'sara@soportetecnico.com',
    role: 'admin',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    status: 'away',
  },
  {
    id: '3',
    name: 'Miguel Usuario',
    email: 'miguel@empresa.com',
    role: 'customer',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    status: 'offline',
  },
];

const tickets: Ticket[] = [
  {
    id: '1',
    title: 'No puedo conectarme a la VPN',
    description: 'No puedo conectarme a la VPN de la empresa desde mi oficina en casa.',
    status: 'open',
    priority: 'high',
    createdAt: '2025-03-15T09:30:00Z',
    updatedAt: '2025-03-15T09:30:00Z',
    customerId: '3',
    category: 'network',
    tags: ['vpn', 'conexión'],
  },
  {
    id: '2',
    title: 'Outlook se cierra al iniciar',
    description: 'Mi aplicación de Outlook se cierra inmediatamente después de abrirse.',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2025-03-14T15:20:00Z',
    updatedAt: '2025-03-15T10:45:00Z',
    customerId: '3',
    technicianId: '1',
    category: 'software',
    tags: ['outlook', 'cierre'],
  },
];

const messages: Message[] = [
  {
    id: '1',
    content: 'Hola, necesito ayuda con mi conexión VPN.',
    senderId: '3',
    receiverId: '1',
    timestamp: '2025-03-15T09:35:00Z',
    ticketId: '1',
    type: 'text',
  },
  {
    id: '2',
    content: 'Hola Miguel, te ayudaré a solucionar tu problema de VPN. ¿Puedes decirme qué mensaje de error estás viendo?',
    senderId: '1',
    receiverId: '3',
    timestamp: '2025-03-15T09:37:00Z',
    ticketId: '1',
    type: 'text',
  },
];

const serviceCategories: ServiceCategory[] = [
  { id: '1', name: 'Problemas de Red', description: 'VPN, Wi-Fi y problemas de conectividad', icon: 'wifi' },
  { id: '2', name: 'Solución de Problemas de Software', description: 'Errores de aplicaciones y problemas de software', icon: 'app-window' },
  { id: '3', name: 'Soporte de Hardware', description: 'Problemas de computadoras y dispositivos periféricos', icon: 'hard-drive' },
  { id: '4', name: 'Acceso a Cuentas', description: 'Problemas de inicio de sesión y recuperación de cuentas', icon: 'user' },
];

// Servicios de API
export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    await delay(800);
    const user = users.find(u => u.email === email);
    if (user) {
      // En el entorno de demostración, aceptamos cualquier contraseña
      return user;
    }
    throw new Error('Credenciales inválidas');
  },
  logout: async (): Promise<void> => {
    await delay(500);
    return;
  },
  getCurrentUser: async (): Promise<User | null> => {
    await delay(300);
    // Para propósitos de demostración, devolver el usuario almacenado en localStorage
    const storedEmail = localStorage.getItem('currentUserEmail');
    if (storedEmail) {
      const user = users.find(u => u.email === storedEmail);
      if (user) return user;
    }
    // Si no hay usuario almacenado, devolver el primer usuario por defecto
    return users[0];
  },
};

export const ticketService = {
  getTickets: async (): Promise<Ticket[]> => {
    await delay(700);
    return tickets;
  },
  getTicketById: async (id: string): Promise<Ticket> => {
    await delay(500);
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
      return ticket;
    }
    throw new Error('Ticket no encontrado');
  },
  createTicket: async (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket> => {
    await delay(800);
    const newTicket: Ticket = {
      ...ticket,
      id: String(tickets.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tickets.push(newTicket);
    return newTicket;
  },
  updateTicket: async (id: string, updates: Partial<Ticket>): Promise<Ticket> => {
    await delay(600);
    const ticketIndex = tickets.findIndex(t => t.id === id);
    if (ticketIndex !== -1) {
      const updatedTicket = {
        ...tickets[ticketIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      tickets[ticketIndex] = updatedTicket;
      return updatedTicket;
    }
    throw new Error('Ticket no encontrado');
  },
};

export const messageService = {
  getMessagesByTicket: async (ticketId: string): Promise<Message[]> => {
    await delay(500);
    return messages.filter(m => m.ticketId === ticketId);
  },
  sendMessage: async (message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => {
    await delay(300);
    const newMessage: Message = {
      ...message,
      id: String(messages.length + 1),
      timestamp: new Date().toISOString(),
    };
    messages.push(newMessage);
    return newMessage;
  },
};

export const userService = {
  getUsers: async (): Promise<User[]> => {
    await delay(800);
    return users;
  },
  getUserById: async (id: string): Promise<User> => {
    await delay(300);
    const user = users.find(u => u.id === id);
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  },
  createUser: async (userData: Omit<User, 'id' | 'status' | 'avatar'>): Promise<User> => {
    await delay(800);
    const newUser: User = {
      ...userData,
      id: String(users.length + 1),
      status: 'offline',
      avatar: `https://randomuser.me/api/portraits/${userData.role === 'admin' ? 'women' : 'men'}/${users.length + 1}.jpg`
    };
    users.push(newUser);
    return newUser;
  },
  updateUserStatus: async (id: string, status: User['status']): Promise<User> => {
    await delay(300);
    const user = users.find(u => u.id === id);
    if (!user) throw new Error('Usuario no encontrado');
    user.status = status;
    return user;
  }
};

export const categoryService = {
  getCategories: async (): Promise<ServiceCategory[]> => {
    await delay(400);
    return serviceCategories;
  },
};