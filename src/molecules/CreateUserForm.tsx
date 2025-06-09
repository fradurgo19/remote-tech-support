import React, { useState } from 'react';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Select } from '../atoms/Select';
import { Mail, User as UserIcon, Shield } from 'lucide-react';

interface CreateUserFormProps {
  onSubmit: (userData: Omit<User, 'id' | 'status' | 'avatar'>) => Promise<void>;
  onCancel: () => void;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSubmit, onCancel }) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'customer' as User['role']
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError('Error al crear el usuario');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const availableRoles = [
    { value: 'customer', label: 'Cliente' },
    { value: 'technician', label: 'Técnico' },
    ...(currentUser?.role === 'admin' ? [{ value: 'admin', label: 'Administrador' }] : [])
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Input
        id="name"
        label="Nombre"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        leftIcon={<UserIcon size={18} />}
        required
      />

      <Input
        id="email"
        type="email"
        label="Email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        leftIcon={<Mail size={18} />}
        required
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-foreground">
          Rol
        </label>
        <Select
          value={formData.role}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as User['role'] }))}
          leftIcon={<Shield size={18} />}
          required
        >
          {availableRoles.map(role => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          Crear Usuario
        </Button>
      </div>
    </form>
  );
}; 