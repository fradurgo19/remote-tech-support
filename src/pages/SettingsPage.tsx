import { Lock, Mail, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '../atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../atoms/Card';
import { Input } from '../atoms/Input';
import { Switch } from '../atoms/Switch';
import { useAuth } from '../context/AuthContext';
import { authService, userService } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    alerts: true,
  });
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Manejar cambio de tema
  const handleThemeChange = (dark: boolean) => {
    setIsDarkMode(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  };

  // Manejar cambio de notificaciones
  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => {
      const newState = { ...prev, [type]: !prev[type] };
      localStorage.setItem('notifications', JSON.stringify(newState));
      return newState;
    });
    toast.success('Preferencias de notificación actualizadas');
  };

  // Manejar cambio de contraseña
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.current || !password.new || !password.confirm) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    if (password.new !== password.confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (password.new.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password.current === password.new) {
      toast.error('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setIsChangingPassword(true);

    try {
      await authService.changePassword(password.current, password.new);
      toast.success('Contraseña actualizada correctamente');
      setPassword({ current: '', new: '', confirm: '' });
    } catch (error: unknown) {
      console.error('Error al cambiar contraseña:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al cambiar la contraseña';
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Manejar subida de avatar
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        toast.error('El archivo es demasiado grande. Máximo 5MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para comprimir imagen
  const compressImage = (
    file: File,
    maxWidth: number = 400,
    quality: number = 0.8
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo la proporción
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = (width * maxWidth) / height;
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a base64 con compresión
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile || !user) return;
    setIsUploading(true);
    try {
      // Subir avatar a Supabase Storage usando FormData
      const result = await userService.uploadAvatar(selectedFile);

      // Agregar timestamp para evitar caché del navegador
      const avatarUrlWithTimestamp = `${result.avatarUrl}?t=${Date.now()}`;

      // Actualizar el usuario en el contexto con la nueva URL
      const updatedUser = { ...user, avatar: avatarUrlWithTimestamp };
      updateUser(updatedUser);

      // Limpiar el estado local
      setSelectedFile(null);
      setPreviewUrl(null);

      toast.success('Avatar actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar avatar:', error);
      toast.error('Error al actualizar el avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>Configuración</h1>

      <div className='grid gap-6'>
        {/* Configuración del perfil */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Perfil</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <div className='h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden'>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt='Preview'
                      className='h-full w-full object-cover'
                    />
                  ) : user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <span className='text-2xl'>{user?.name?.[0]}</span>
                  )}
                </div>
                <input
                  type='file'
                  id='avatar-upload'
                  className='hidden'
                  accept='image/*'
                  onChange={handleFileSelect}
                />
                <label
                  htmlFor='avatar-upload'
                  className='absolute bottom-0 right-0 bg-primary text-primary-foreground p-1 rounded-full cursor-pointer hover:bg-primary/90'
                >
                  <Upload size={14} />
                </label>
              </div>
              <div className='flex-1'>
                <p className='text-sm text-muted-foreground mb-2'>
                  Recomendado: Imagen cuadrada, al menos 400x400px
                </p>
                {selectedFile && (
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      onClick={handleAvatarUpload}
                      isLoading={isUploading}
                    >
                      Guardar
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Input label='Nombre para Mostrar' defaultValue={user?.name} />

            <Input
              label='Dirección de Email'
              defaultValue={user?.email}
              leftIcon={<Mail size={18} />}
              disabled
            />
          </CardContent>
        </Card>

        {/* Preferencias de notificación */}
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <label className='text-sm font-medium'>
                  Notificaciones Push
                </label>
                <p className='text-sm text-muted-foreground'>
                  Recibe notificaciones en tiempo real
                </p>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={() => handleNotificationChange('push')}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <label className='text-sm font-medium'>
                  Notificaciones por Email
                </label>
                <p className='text-sm text-muted-foreground'>
                  Recibe actualizaciones por correo electrónico
                </p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={() => handleNotificationChange('email')}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <label className='text-sm font-medium'>
                  Alertas de Sistema
                </label>
                <p className='text-sm text-muted-foreground'>
                  Recibe alertas importantes del sistema
                </p>
              </div>
              <Switch
                checked={notifications.alerts}
                onCheckedChange={() => handleNotificationChange('alerts')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Apariencia */}
        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <label className='text-sm font-medium'>Modo Oscuro</label>
                <p className='text-sm text-muted-foreground'>
                  Cambia entre tema claro y oscuro
                </p>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={handleThemeChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cambio de contraseña */}
        <Card>
          <CardHeader>
            <CardTitle>Cambiar Contraseña</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className='space-y-4'>
              <Input
                type='password'
                label='Contraseña Actual'
                value={password.current}
                onChange={e =>
                  setPassword(prev => ({ ...prev, current: e.target.value }))
                }
                leftIcon={<Lock size={18} />}
                required
              />

              <Input
                type='password'
                label='Nueva Contraseña'
                value={password.new}
                onChange={e =>
                  setPassword(prev => ({ ...prev, new: e.target.value }))
                }
                leftIcon={<Lock size={18} />}
                required
              />

              <Input
                type='password'
                label='Confirmar Nueva Contraseña'
                value={password.confirm}
                onChange={e =>
                  setPassword(prev => ({ ...prev, confirm: e.target.value }))
                }
                leftIcon={<Lock size={18} />}
                required
              />

              <Button type='submit' isLoading={isChangingPassword}>
                {isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
