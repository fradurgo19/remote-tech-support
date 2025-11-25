import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/api';
import { socketService } from '../services/socket';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  updateUserStatus: (status: User['status']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          // Establecer estado como online al conectar
          const userWithOnlineStatus = { ...currentUser, status: 'online' as const };
          setUser(userWithOnlineStatus);
          socketService.connect(userWithOnlineStatus);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Escuchar cambios de conexión del socket para actualizar estado del usuario
  useEffect(() => {
    if (!user) return;

    const unsubscribe = socketService.onConnectionChange(
      // On connect - establecer como online
      () => {
        console.log('🟢 Socket conectado - Usuario online');
        setUser(prev => prev ? { ...prev, status: 'online' } : null);
      },
      // On disconnect - establecer como offline
      () => {
        console.log('🔴 Socket desconectado - Usuario offline');
        setUser(prev => prev ? { ...prev, status: 'offline' } : null);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const loggedInUser = await authService.login(email, password);
      // Establecer estado como online al iniciar sesión
      const userWithOnlineStatus = { ...loggedInUser, status: 'online' as const };
      setUser(userWithOnlineStatus);
      localStorage.setItem('currentUserEmail', loggedInUser.email);
      socketService.connect(userWithOnlineStatus);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      await authService.logout();
      localStorage.removeItem('currentUserEmail');
      socketService.disconnect();
      setUser(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // En una aplicación real, aquí se actualizaría el usuario en el servidor
  };

  const updateUserStatus = (status: User['status']) => {
    if (user) {
      const updatedUser = { ...user, status };
      setUser(updatedUser);
      // In a real app, this would update the status on the server too
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        updateUser,
        updateUserStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};