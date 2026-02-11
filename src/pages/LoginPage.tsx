import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Headset, Lock, Mail, User } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';

const MAX_USER_SUGGESTIONS = 20;

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<'select' | 'manual'>('select');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userSearchContainerRef = useRef<HTMLDivElement>(null);

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

  const handleSelectUser = useCallback(
    (selectedEmail: string) => {
      const selectedUser = users.find(u => u.email === selectedEmail);
      if (selectedUser) {
        setEmail(selectedUser.email);
        setPassword('');
        setUserSearchQuery('');
        setIsUserDropdownOpen(false);
      }
    },
    [users]
  );

  const handleModeChange = (mode: 'select' | 'manual') => {
    setLoginMode(mode);
    setEmail('');
    setPassword('');
    setUserSearchQuery('');
    setIsUserDropdownOpen(false);
    setError(null);
  };

  const filteredUsers = useMemo(() => {
    const query = userSearchQuery.trim().toLowerCase();
    if (!query) return users.slice(0, MAX_USER_SUGGESTIONS);
    return users
      .filter(
        u =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      )
      .slice(0, MAX_USER_SUGGESTIONS);
  }, [users, userSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userSearchContainerRef.current &&
        !userSearchContainerRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedUser = useMemo(
    () => (email ? users.find(u => u.email === email) : null),
    [users, email]
  );
  const userInputDisplay =
    selectedUser && !isUserDropdownOpen
      ? `${selectedUser.name} (${selectedUser.role})`
      : userSearchQuery;

  const getSelectPlaceholder = (): string => {
    if (usersLoading) return 'Cargando usuarios...';
    if (usersError) return 'Error al cargar usuarios';
    if (users.length === 0) return 'No hay usuarios disponibles';
    return 'Buscar por nombre o email...';
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5'>
      {/* Logo de la compañía - Esquina superior izquierda */}
      <div className='absolute top-4 left-4 md:top-6 md:left-6'>
        <img
          src='https://res.cloudinary.com/dbufrzoda/image/upload/v1762897590/Logo2_eedoer.jpg'
          alt='Partequipos Logo'
          className='h-12 w-12 md:h-16 md:w-16 rounded-full object-cover'
        />
      </div>

      {/* Botón Ticket Soporte Remoto - Esquina superior derecha */}
      <div className='absolute top-4 right-4 md:top-6 md:right-6'>
        <Button
          type='button'
          variant='outline'
          onClick={() => navigate('/solicitar-soporte')}
          className='text-sm font-medium'
        >
          Ticket Soporte Remoto
        </Button>
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
              <div className='space-y-1' ref={userSearchContainerRef}>
                <label
                  htmlFor='user-search'
                  className='block text-sm font-medium text-foreground'
                >
                  Seleccionar Usuario
                </label>
                <div className='relative'>
                  <Input
                    id='user-search'
                    type='text'
                    autoComplete='off'
                    value={userInputDisplay}
                    onChange={e => {
                      setUserSearchQuery(e.target.value);
                      setIsUserDropdownOpen(true);
                    }}
                    onFocus={() => setIsUserDropdownOpen(true)}
                    placeholder={getSelectPlaceholder()}
                    leftIcon={<User size={18} />}
                    disabled={usersLoading || !!usersError}
                    aria-expanded={isUserDropdownOpen}
                    aria-controls='user-listbox'
                  />
                  {isUserDropdownOpen && (
                    <div
                      id='user-listbox'
                      className='absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md border border-border bg-card py-1 shadow-lg'
                      aria-label='Resultados de búsqueda de usuarios'
                    >
                      {filteredUsers.length === 0 ? (
                        <div className='px-3 py-2 text-sm text-muted-foreground'>
                          No se encontraron usuarios
                        </div>
                      ) : (
                        filteredUsers.map(user => (
                          <button
                            key={user.id}
                            type='button'
                            className='w-full text-left cursor-pointer px-3 py-2 text-sm hover:bg-muted focus:bg-muted focus:outline-none border-0 bg-transparent'
                            onClick={() => handleSelectUser(user.email)}
                          >
                            {user.name} ({user.role})
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
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
