import { useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socket';
import { User } from '../types';

interface UserStatusMap {
  [userId: string]: User['status'];
}

/**
 * Hook para manejar el estado de conexión de usuarios en tiempo real
 */
export const useUserStatus = (initialUsers?: Record<string, User>) => {
  const [userStatuses, setUserStatuses] = useState<UserStatusMap>(() => {
    // Inicializar con los estados de los usuarios proporcionados
    if (initialUsers) {
      const statusMap: UserStatusMap = {};
      Object.values(initialUsers).forEach(user => {
        statusMap[user.id] = user.status || 'offline';
      });
      return statusMap;
    }
    return {};
  });

  // Actualizar estados cuando cambian los usuarios iniciales
  useEffect(() => {
    if (initialUsers) {
      setUserStatuses(prev => {
        const newStatuses = { ...prev };
        Object.values(initialUsers).forEach(user => {
          // Solo actualizar si no tenemos un estado en tiempo real
          if (!prev[user.id]) {
            newStatuses[user.id] = user.status || 'offline';
          }
        });
        return newStatuses;
      });
    }
  }, [initialUsers]);

  // Escuchar cambios de estado de usuarios en tiempo real
  useEffect(() => {
    const unsubscribe = socketService.onUserStatusChange((data) => {
      console.log('🔄 User status changed:', data);
      setUserStatuses(prev => ({
        ...prev,
        [data.userId]: data.status,
      }));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Función para obtener el estado de un usuario específico
  const getUserStatus = useCallback((userId: string): User['status'] => {
    return userStatuses[userId] || 'offline';
  }, [userStatuses]);

  // Función para obtener el estado con el usuario combinado
  const getUserWithStatus = useCallback((user: User | undefined): User | undefined => {
    if (!user) return undefined;
    return {
      ...user,
      status: userStatuses[user.id] || user.status || 'offline',
    };
  }, [userStatuses]);

  return {
    userStatuses,
    getUserStatus,
    getUserWithStatus,
  };
};

export default useUserStatus;

