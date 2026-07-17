import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Headset, Lock, Mail, User } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';

const MAX_USER_SUGGESTIONS = 20;

const LOGIN_BG_URL =
  'https://res.cloudinary.com/dbufrzoda/image/upload/v1782573746/Gemini_Generated_Image_7wjtkl7wjtkl7wjt_zmezmj.png';

const LOGO_URL =
  'https://res.cloudinary.com/dbufrzoda/image/upload/v1762897590/Logo2_eedoer.jpg';

function getSelectPlaceholder(
  usersLoading: boolean,
  usersError: unknown,
  usersCount: number
): string {
  if (usersLoading) return 'Cargando usuarios...';
  if (usersError) return 'Error al cargar usuarios';
  if (usersCount === 0) return 'No hay usuarios disponibles';
  return 'Buscar por nombre o email...';
}

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

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ['users-public'],
    queryFn: userService.getUsersPublic,
    staleTime: 5 * 60 * 1000,
    retry: false,
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

  return (
    <div className='relative min-h-screen overflow-hidden'>
      {/* Fondo full-bleed */}
      <div className='absolute inset-0' aria-hidden>
        <img
          src={LOGIN_BG_URL}
          alt=''
          className='h-full w-full object-cover object-center scale-105'
        />
        {/* Overlay institucional: gris #50504f + rojo #cf1b22 */}
        <div className='absolute inset-0 bg-gradient-to-br from-secondary/85 via-secondary/60 to-primary/50' />
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.25),transparent_55%)]' />
        <div
          className='absolute inset-0 opacity-[0.06] pointer-events-none'
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Barra superior */}
      <header className='relative z-20 flex items-center justify-between px-4 py-4 md:px-8 md:py-6'>
        <div className='flex items-center gap-3'>
          <img
            src={LOGO_URL}
            alt='Partequipos'
            className='h-12 w-12 md:h-14 md:w-14 rounded-full object-cover ring-2 ring-white/40 shadow-lg'
          />
          <div className='hidden sm:block text-white'>
            <p className='text-sm font-semibold tracking-wide'>Partequipos</p>
            <p className='text-[11px] text-white/75 uppercase tracking-[0.18em]'>
              Soporte Remoto
            </p>
          </div>
        </div>
        <Button
          type='button'
          variant='outline'
          onClick={() => navigate('/solicitar-soporte')}
          className='text-sm font-medium border-white/50 bg-white/15 text-white hover:bg-primary hover:border-primary hover:text-primary-foreground backdrop-blur-md'
        >
          Ticket Soporte Remoto
        </Button>
      </header>

      {/* Contenido */}
      <div className='relative z-10 flex min-h-[calc(100vh-5.5rem)] items-center justify-center px-4 pb-10 pt-2 md:justify-end md:pr-12 lg:pr-20'>
        <div className='w-full max-w-md'>
          <div className='mb-4 flex items-center gap-2 text-white/85'>
            <span className='h-px w-8 bg-gradient-to-r from-transparent to-primary' />
            <span className='text-[11px] uppercase tracking-[0.22em] font-medium'>
              Acceso seguro
            </span>
          </div>

          <div className='relative overflow-hidden rounded-2xl border border-white/25 bg-secondary/75 shadow-2xl shadow-secondary/40 backdrop-blur-xl'>
            <div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent' />
            <div className='pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/25 blur-3xl' />

            <div className='relative p-8 space-y-7'>
              <div className='text-center'>
                <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/40 ring-1 ring-white/25'>
                  <Headset size={28} className='text-primary-foreground' />
                </div>
                <h1 className='mt-4 text-2xl font-bold tracking-tight text-white'>
                  Plataforma de Soporte Técnico
                </h1>
                <p className='mt-1.5 text-sm text-white/75'>
                  Inicia sesión en tu cuenta para continuar
                </p>
              </div>

              {error && (
                <div className='flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/20 p-3 text-sm text-white'>
                  <AlertCircle size={16} className='shrink-0 text-primary-foreground' />
                  <span>{error}</span>
                </div>
              )}

              {usersError && (
                <div className='flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/20 p-3 text-sm text-white'>
                  <AlertCircle size={16} className='shrink-0' />
                  <span>
                    No se pudieron cargar los usuarios. Usa el modo &quot;Ingresar
                    Email&quot; para continuar.
                  </span>
                </div>
              )}

              <form className='space-y-6' onSubmit={handleSubmit}>
                <div className='flex rounded-xl bg-black/20 p-1 ring-1 ring-white/15'>
                  <button
                    type='button'
                    onClick={() => handleModeChange('select')}
                    className={`flex-1 rounded-lg py-2.5 px-3 text-sm font-medium transition-all ${
                      loginMode === 'select'
                        ? 'bg-white text-secondary shadow-md'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <User size={16} className='inline mr-2' />
                    Seleccionar Usuario
                  </button>
                  <button
                    type='button'
                    onClick={() => handleModeChange('manual')}
                    className={`flex-1 rounded-lg py-2.5 px-3 text-sm font-medium transition-all ${
                      loginMode === 'manual'
                        ? 'bg-white text-secondary shadow-md'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Mail size={16} className='inline mr-2' />
                    Ingresar Email
                  </button>
                </div>

                <div className='space-y-4 login-fields'>
                  {loginMode === 'select' ? (
                    <div className='space-y-1' ref={userSearchContainerRef}>
                      <label
                        htmlFor='user-search'
                        className='block text-sm font-medium text-white'
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
                          placeholder={getSelectPlaceholder(
                            usersLoading,
                            usersError,
                            users.length
                          )}
                          leftIcon={<User size={18} />}
                          disabled={usersLoading || !!usersError}
                          aria-expanded={isUserDropdownOpen}
                          aria-controls='user-listbox'
                          className='bg-white border-white/30 text-foreground'
                        />
                        {isUserDropdownOpen && (
                          <div
                            id='user-listbox'
                            className='absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-md border border-border bg-card py-1 shadow-xl'
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
                    <div className='[&_label]:text-white'>
                      <Input
                        id='email'
                        type='email'
                        label='Email'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder='tu@email.com'
                        leftIcon={<Mail size={18} />}
                        required
                        className='bg-white border-white/30 text-foreground'
                      />
                    </div>
                  )}

                  <div className='[&_label]:text-white'>
                    <Input
                      id='password'
                      type='password'
                      label='Contraseña'
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder='••••••••'
                      leftIcon={<Lock size={18} />}
                      required
                      className='bg-white border-white/30 text-foreground'
                    />
                  </div>
                </div>

                <Button type='submit' className='w-full' isLoading={isLoading}>
                  Iniciar Sesión
                </Button>
              </form>

              <div className='text-center text-xs text-white/65'>
                <p>
                  {loginMode === 'select'
                    ? 'Selecciona un usuario de la lista o cambia a modo manual'
                    : 'Ingresa tu email y contraseña para iniciar sesión'}
                </p>
              </div>

              <button
                type='button'
                onClick={() => navigate('/forgot-password')}
                className='w-full text-sm font-medium text-primary hover:brightness-110 underline-offset-4 hover:underline'
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          <p className='mt-5 text-center text-[11px] text-white/55 tracking-wide'>
            Maquinaria · Soporte técnico remoto · Partequipos
          </p>
        </div>
      </div>
    </div>
  );
};
