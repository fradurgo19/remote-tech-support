import { User, Ticket, Message, CallSession, ServiceCategory } from '../types';

// Servicio de API simulado - En una aplicación real, esto haría llamadas API reales
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Datos de ejemplo
const users: User[] = [
  {
    id: '1',
    name: 'Juan Técnico',
    email: 'auxiliar.garantiasbg@partequipos.com',
    role: 'technician',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    status: 'online',
  },
  {
    id: '2',
    name: 'Soporte al Producto',
    email: 'analista.mantenimiento@partequipos.com',
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
  { 
    id: '1', 
    name: 'Soporte Remoto', 
    description: 'Asistencia técnica remota para resolver problemas de software, hardware y conectividad', 
    icon: 'headset' 
  }
];

// Claves para localStorage
const STORAGE_KEYS = {
  USERS: 'remote_support_users',
  TICKETS: 'remote_support_tickets',
  MESSAGES: 'remote_support_messages',
  CATEGORIES: 'remote_support_categories'
};

// Función para inicializar datos en localStorage si no existen
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(serviceCategories));
  }
};

// Inicializar almacenamiento
initializeStorage();

// Función helper para obtener datos del localStorage
const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Función helper para guardar datos en localStorage
const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Servicios de API actualizados
export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    await delay(800);
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const user = users.find(u => u.email === email);
    if (user) {
      // En el entorno de demostración, verificamos la contraseña
      const passwords: Record<string, string> = {
        'auxiliar.garantiasbg@partequipos.com': 'Garantias2024*',
        'analista.mantenimiento@partequipos.com': 'Mantenimiento2024*',
        'miguel@empresa.com': 'Cliente2024*'
      };
      
      if (passwords[email] === password) {
        return user;
      }
    }
    throw new Error('Credenciales inválidas');
  },
  logout: async (): Promise<void> => {
    await delay(500);
    return;
  },
  getCurrentUser: async (): Promise<User | null> => {
    await delay(300);
    const storedEmail = localStorage.getItem('currentUserEmail');
    if (storedEmail) {
      const users = getFromStorage<User>(STORAGE_KEYS.USERS);
      const user = users.find(u => u.email === storedEmail);
      if (user) return user;
    }
    return null;
  },
};

export const userService = {
  getUsers: async (): Promise<User[]> => {
    await delay(800);
    return getFromStorage<User>(STORAGE_KEYS.USERS);
  },
  getUserById: async (id: string): Promise<User> => {
    await delay(300);
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const user = users.find(u => u.id === id);
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  },
  createUser: async (userData: Omit<User, 'id' | 'status' | 'avatar'>): Promise<User> => {
    await delay(800);
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const newUser: User = {
      ...userData,
      id: String(users.length + 1),
      status: 'offline',
      avatar: `https://randomuser.me/api/portraits/${userData.role === 'admin' ? 'women' : 'men'}/${users.length + 1}.jpg`
    };
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    return newUser;
  },
  updateUserStatus: async (id: string, status: User['status']): Promise<User> => {
    await delay(300);
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) throw new Error('Usuario no encontrado');
    users[userIndex].status = status;
    saveToStorage(STORAGE_KEYS.USERS, users);
    return users[userIndex];
  }
};

export const ticketService = {
  getTickets: async (): Promise<Ticket[]> => {
    await delay(800);
    return getFromStorage<Ticket>(STORAGE_KEYS.TICKETS);
  },
  getTicketById: async (id: string): Promise<Ticket> => {
    await delay(300);
    const tickets = getFromStorage<Ticket>(STORAGE_KEYS.TICKETS);
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) throw new Error('Ticket no encontrado');
    return ticket;
  },
  createTicket: async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket> => {
    await delay(800);
    const tickets = getFromStorage<Ticket>(STORAGE_KEYS.TICKETS);
    const newTicket: Ticket = {
      ...ticketData,
      id: String(tickets.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tickets.push(newTicket);
    saveToStorage(STORAGE_KEYS.TICKETS, tickets);
    return newTicket;
  },
  updateTicket: async (id: string, updates: Partial<Ticket>): Promise<Ticket> => {
    await delay(300);
    const tickets = getFromStorage<Ticket>(STORAGE_KEYS.TICKETS);
    const ticketIndex = tickets.findIndex(t => t.id === id);
    if (ticketIndex === -1) throw new Error('Ticket no encontrado');
    
    tickets[ticketIndex] = {
      ...tickets[ticketIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    saveToStorage(STORAGE_KEYS.TICKETS, tickets);
    return tickets[ticketIndex];
  }
};

export const messageService = {
  getMessagesByTicket: async (ticketId: string): Promise<Message[]> => {
    await delay(300);
    const messages = getFromStorage<Message>(STORAGE_KEYS.MESSAGES);
    return messages.filter(m => m.ticketId === ticketId);
  },
  sendMessage: async (messageData: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => {
    await delay(300);
    const messages = getFromStorage<Message>(STORAGE_KEYS.MESSAGES);
    const newMessage: Message = {
      ...messageData,
      id: String(messages.length + 1),
      timestamp: new Date().toISOString(),
    };
    messages.push(newMessage);
    saveToStorage(STORAGE_KEYS.MESSAGES, messages);
    return newMessage;
  }
};

export const categoryService = {
  getCategories: async (): Promise<ServiceCategory[]> => {
    await delay(300);
    return getFromStorage<ServiceCategory>(STORAGE_KEYS.CATEGORIES);
  }
};