import {
  CreateUserData,
  Message,
  ServiceCategory,
  Ticket,
  UpdateUserData,
  User,
} from '../types';

// Servicio de API simulado - En una aplicación real, esto haría llamadas API reales
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Datos de ejemplo
const users: User[] = [
  {
    id: '1',
    name: 'Juan Técnico',
    email: 'auxiliar.garantiasbg@partequipos.com',
    role: 'technician',
    avatar:
      'https://res.cloudinary.com/dbufrzoda/image/upload/v1749590236/Soporte_hcfjxa.png',
    status: 'online',
    emailVerified: true,
    passwordResetToken: null,
  },
  {
    id: '2',
    name: 'Soporte al Producto',
    email: 'analista.mantenimiento@partequipos.com',
    role: 'admin',
    avatar:
      'https://res.cloudinary.com/dbufrzoda/image/upload/v1749590236/Admin_sublte.png',
    status: 'away',
    emailVerified: true,
    passwordResetToken: null,
  },
  {
    id: '3',
    name: 'Miguel Usuario',
    email: 'miguel@empresa.com',
    role: 'customer',
    avatar:
      'https://res.cloudinary.com/dbufrzoda/image/upload/v1749590235/Cliente_kgzuwh.jpg',
    status: 'offline',
    emailVerified: true,
    passwordResetToken: null,
  },
];

const tickets: Ticket[] = [
  {
    id: '1',
    title: 'No puedo conectarme a la VPN',
    description:
      'No puedo conectarme a la VPN de la empresa desde mi oficina en casa.',
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
    description:
      'Mi aplicación de Outlook se cierra inmediatamente después de abrirse.',
    status: 'in_progress',
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
    content:
      'Hola Miguel, te ayudaré a solucionar tu problema de VPN. ¿Puedes decirme qué mensaje de error estás viendo?',
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
    description:
      'Asistencia técnica remota para resolver problemas de Maquinaria Pesada',
    icon: 'headset',
  },
];

// Claves para localStorage
const STORAGE_KEYS = {
  USERS: 'remote_support_users',
  TICKETS: 'remote_support_tickets',
  MESSAGES: 'remote_support_messages',
  CATEGORIES: 'remote_support_categories',
};

// Función para inicializar datos en localStorage si no existen
const initializeStorage = () => {
  // Forzar la actualización de los datos
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  localStorage.setItem(
    STORAGE_KEYS.CATEGORIES,
    JSON.stringify(serviceCategories)
  );
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
    const data = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Guardar el token en localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('currentUserEmail', data.user.email);

    return data.user;
  },
  logout: async (): Promise<void> => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUserEmail');
    return;
  },
  getCurrentUser: async (): Promise<User | null> => {
    const token = getAuthToken();
    if (!token) {
      return null;
    }

    try {
      // Verificar si el token es válido haciendo una llamada al backend
      const response = await fetch('http://localhost:3000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.user;
      } else {
        // Token inválido, limpiar localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUserEmail');
        return null;
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      // En caso de error, limpiar localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUserEmail');
      return null;
    }
  },
  forgotPassword: async (
    email: string
  ): Promise<{ message: string; token: string }> => {
    await delay(500);
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    const token = Math.random().toString(36).substring(2, 15);
    return {
      message: 'Se ha enviado un correo de recuperación (simulado)',
      token,
    };
  },
  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    await delay(500);
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const user = users.find(u => u.passwordResetToken === token);
    if (!user) {
      throw new Error('Token inválido');
    }
    return { message: 'Contraseña actualizada correctamente' };
  },
  sendVerificationEmail: async (
    email: string
  ): Promise<{ message: string; token: string }> => {
    await delay(500);
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    const token = Math.random().toString(36).substring(2, 15);
    return {
      message: 'Se ha enviado un correo de verificación (simulado)',
      token,
    };
  },
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    await delay(500);
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const user = users.find(u => u.passwordResetToken === token);
    if (!user) {
      throw new Error('Token inválido');
    }
    return { message: 'Email verificado correctamente' };
  },
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    await apiCall('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiCall('/api/users', {
      method: 'GET',
    });
    return response;
  },
  getUsersPublic: async (): Promise<User[]> => {
    const response = await fetch('http://localhost:3000/api/users/public');
    if (!response.ok) {
      throw new Error('Error al cargar usuarios');
    }
    return response.json();
  },
  getUserById: async (id: string): Promise<User> => {
    const response = await apiCall(`/api/users/${id}`, {
      method: 'GET',
    });
    return response;
  },
  createUser: async (userData: CreateUserData): Promise<User> => {
    const response = await apiCall('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.user;
  },
  updateUser: async (id: string, userData: UpdateUserData): Promise<User> => {
    const response = await apiCall(`/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.user;
  },
  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiCall('/api/users/avatar', {
      method: 'POST',
      body: formData,
      // No incluir Content-Type header - el navegador lo agrega automáticamente con boundary
    });
    return response;
  },
  updateUserStatus: async (
    id: string,
    status: User['status']
  ): Promise<User> => {
    const response = await apiCall(`/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    return response.user;
  },
  deleteUser: async (id: string): Promise<void> => {
    await apiCall(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },
  searchCustomers: async (email?: string, name?: string): Promise<User[]> => {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (name) params.append('name', name);

    const response = await apiCall(
      `/api/users/search/customers?${params.toString()}`
    );
    return response;
  },
};

// Función helper para obtener el token de autenticación
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Función helper para hacer llamadas HTTP
const apiCall = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAuthToken();
  const response = await fetch(`http://localhost:3000${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();

    // Manejar errores específicos de permisos
    if (response.status === 403) {
      throw new Error(
        errorData.message || 'No tienes permisos para realizar esta acción'
      );
    } else if (response.status === 404) {
      throw new Error(errorData.message || 'Recurso no encontrado');
    } else if (response.status === 401) {
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente');
    }

    throw new Error(errorData.message || 'Error en la API');
  }

  return response.json();
};

export const ticketService = {
  getTickets: async (): Promise<Ticket[]> => {
    const data = await apiCall('/api/tickets');
    return data;
  },
  getTicketById: async (id: string): Promise<Ticket> => {
    const data = await apiCall(`/api/tickets/${id}`);
    return data;
  },
  createTicket: async (
    ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'> & {
      customerEmail?: string;
      customerName?: string;
    }
  ): Promise<Ticket> => {
    const data = await apiCall('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
    return data.ticket;
  },
  updateTicket: async (
    id: string,
    updates: Partial<Ticket>
  ): Promise<Ticket> => {
    const data = await apiCall(`/api/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.ticket;
  },
};

export const messageService = {
  getMessagesByTicket: async (ticketId: string): Promise<Message[]> => {
    const response = await apiCall(`/api/messages/${ticketId}`, {
      method: 'GET',
    });
    return response;
  },
  sendMessage: async (
    messageData: Omit<Message, 'id' | 'timestamp'>
  ): Promise<Message> => {
    const response = await apiCall('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });
    return response.data;
  },
  sendFileMessage: async (ticketId: string, file: File): Promise<Message> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ticketId', ticketId);
    formData.append('type', 'file');

    const token = getAuthToken();
    const response = await fetch('http://localhost:3000/api/messages/file', {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error al enviar archivo');
    }

    const data = await response.json();
    return data.data;
  },
};

export const categoryService = {
  getCategories: async (): Promise<ServiceCategory[]> => {
    const data = await apiCall('/api/categories');
    return data;
  },
};

export const reportService = {
  getReports: async (): Promise<Report[]> => {
    const data = await apiCall('/api/reports');
    return data;
  },
  getReportById: async (id: string): Promise<Report> => {
    const data = await apiCall(`/api/reports/${id}`);
    return data;
  },
  createReport: async (
    reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Report> => {
    const data = await apiCall('/api/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
    return data.report;
  },
  updateReport: async (
    id: string,
    updates: Partial<Report>
  ): Promise<Report> => {
    const data = await apiCall(`/api/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.report;
  },
  deleteReport: async (id: string): Promise<void> => {
    await apiCall(`/api/reports/${id}`, {
      method: 'DELETE',
    });
  },
};
