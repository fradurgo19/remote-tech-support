import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../atoms/Card';
import { Avatar } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';
import { Spinner } from '../atoms/Spinner';
import { AlertCircle, Mail, UserCog, X } from 'lucide-react';
import { Button } from '../atoms/Button';
import { CreateUserForm } from '../molecules/CreateUserForm';
import { useAuth } from '../context/AuthContext';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Error al cargar los usuarios');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (userData: Omit<User, 'id' | 'status' | 'avatar'>) => {
    try {
      await userService.createUser(userData);
      await fetchUsers();
      setIsCreatingUser(false);
    } catch (err) {
      console.error('Error al crear usuario:', err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error al Cargar los Usuarios</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Intentar de Nuevo</Button>
        </div>
      </div>
    );
  }

  const getRoleTranslation = (role: User['role']) => {
    const translations = {
      'admin': 'Administrador',
      'technician': 'Técnico',
      'customer': 'Cliente'
    };
    return translations[role];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Button 
          leftIcon={<UserCog size={18} />}
          onClick={() => setIsCreatingUser(true)}
        >
          Agregar Usuario
        </Button>
      </div>
      
      {isCreatingUser && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Crear Nuevo Usuario</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCreatingUser(false)}
            >
              <X size={18} />
            </Button>
          </CardHeader>
          <CardContent>
            <CreateUserForm
              onSubmit={handleCreateUser}
              onCancel={() => setIsCreatingUser(false)}
            />
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar 
                  src={user.avatar} 
                  size="lg"
                  status={user.status}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate">{user.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Mail size={14} />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <Badge 
                    variant={user.role === 'admin' ? 'primary' : 
                            user.role === 'technician' ? 'secondary' : 
                            'default'}
                    className="capitalize"
                  >
                    {getRoleTranslation(user.role)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};