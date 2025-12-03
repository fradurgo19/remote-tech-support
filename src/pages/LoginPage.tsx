import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Headset, Lock, Mail, User } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<'select' | 'manual'>('select');

  const { login } = useAuth();
  const navigate = useNavigate();

  // Cargar usuarios desde la API (ruta pública)
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ['users-public'],
    queryFn: userService.getUsersPublic,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false, // No reintentar si falla
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Email o contraseña incorrectos');
      console.error('Error de inicio de sesión:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = users.find(user => user.email === e.target.value);
    if (selectedUser) {
      setEmail(selectedUser.email);
      setPassword(''); // Limpiar contraseña para que el usuario la ingrese
    }
  };

  const handleModeChange = (mode: 'select' | 'manual') => {
    setLoginMode(mode);
    setEmail('');
    setPassword('');
    setError(null);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5'>
      {/* Logo de la compañía - Esquina superior izquierda */}
      <div className='absolute top-4 left-4 md:top-6 md:left-6'>
        <img
          src='https://res.cloudinary.com/dbufrzoda/image/upload/v1750457354/Captura_de_pantalla_2025-06-20_170819_wzmyli.png'
          alt='Partequipos Logo'
          className='h-12 md:h-16 w-auto object-contain'
        />
      </div>

      <div className='w-full max-w-md p-8 space-y-8 bg-card shadow-lg rounded-xl border border-border'>
        <div className='text-center'>
          <div className='mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center'>
            <Headset size={28} className='text-primary' />
          </div>
          <h1 className='mt-4 text-2xl font-bold'>
            Plataforma de Soporte Técnico
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Inicia sesión en tu cuenta para continuar
          </p>
        </div>

        {error && (
          <div className='p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2 text-sm'>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {usersError && (
          <div className='p-3 rounded-md bg-yellow-500/10 text-yellow-600 flex items-center gap-2 text-sm'>
            <AlertCircle size={16} />
            <span>
              No se pudieron cargar los usuarios. Usa el modo "Ingresar Email"
              para continuar.
            </span>
          </div>
        )}

        <form className='space-y-6' onSubmit={handleSubmit}>
          {/* Botones de modo de login */}
          <div className='flex rounded-lg bg-muted p-1'>
            <button
              type='button'
              onClick={() => handleModeChange('select')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMode === 'select'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User size={16} className='inline mr-2' />
              Seleccionar Usuario
            </button>
            <button
              type='button'
              onClick={() => handleModeChange('manual')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMode === 'manual'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail size={16} className='inline mr-2' />
              Ingresar Email
            </button>
          </div>

          <div className='space-y-4'>
            {loginMode === 'select' ? (
              <div className='space-y-1'>
                <label className='block text-sm font-medium text-foreground'>
                  Seleccionar Usuario
                </label>
                <Select
                  value={email}
                  onChange={handleUserChange}
                  leftIcon={<User size={18} />}
                  disabled={usersLoading || !!usersError}
                >
                  <option value=''>
                    {usersLoading
                      ? 'Cargando usuarios...'
                      : usersError
                      ? 'Error al cargar usuarios'
                      : users.length === 0
                      ? 'No hay usuarios disponibles'
                      : 'Selecciona un usuario...'}
                  </option>
                  {users.map(user => (
                    <option key={user.id} value={user.email}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <Input
                id='email'
                type='email'
                label='Email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='tu@email.com'
                leftIcon={<Mail size={18} />}
                required
              />
            )}

            <Input
              id='password'
              type='password'
              label='Contraseña'
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='••••••••'
              leftIcon={<Lock size={18} />}
              required
            />
          </div>

          <div>
            <Button type='submit' className='w-full' isLoading={isLoading}>
              Iniciar Sesión
            </Button>
          </div>
        </form>

        <div className='text-center text-xs text-muted-foreground'>
          <p>
            {loginMode === 'select'
              ? 'Selecciona un usuario de la lista o cambia a modo manual'
              : 'Ingresa tu email y contraseña para iniciar sesión'}
          </p>
        </div>

        <button
          onClick={() => navigate('/forgot-password')}
          className='w-full mt-4 text-primary hover:underline font-medium'
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
    </div>
  );
};
