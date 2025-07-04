import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../atoms/Card';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { useAuth } from '../context/AuthContext';
import { Switch } from '../atoms/Switch';
import { 
  Bell, 
  Mail, 
  Lock, 
  Globe, 
  Moon,
  Sun,
  Volume2,
  Upload,
  Check,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    alerts: true
  });
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });
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
    if (password.new !== password.confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    try {
      // Aquí iría la llamada a la API para cambiar la contraseña
      toast.success('Contraseña actualizada correctamente');
      setPassword({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error('Error al cambiar la contraseña');
    }
  };

  // Manejar subida de avatar
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
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

  const handleAvatarUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      // Aquí iría la llamada a la API para subir el avatar
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación de subida
      if (user) {
        updateUser({ ...user, avatar: previewUrl || undefined });
      }
      toast.success('Avatar actualizado correctamente');
    } catch (error) {
      toast.error('Error al subir el avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuración</h1>
      
      <div className="grid gap-6">
        {/* Configuración del perfil */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="h-full w-full object-cover"
                    />
                  ) : user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user?.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{user?.name?.[0]}</span>
                  )}
                </div>
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1 rounded-full cursor-pointer hover:bg-primary/90"
                >
                  <Upload size={14} />
                </label>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  Recomendado: Imagen cuadrada, al menos 400x400px
                </p>
                {selectedFile && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAvatarUpload}
                      isLoading={isUploading}
                    >
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
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
            
            <Input
              label="Nombre para Mostrar"
              defaultValue={user?.name}
            />
            
            <Input
              label="Dirección de Email"
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
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Notificaciones Push</label>
                <p className="text-sm text-muted-foreground">
                  Recibe notificaciones en tiempo real
                </p>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={() => handleNotificationChange('push')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Notificaciones por Email</label>
                <p className="text-sm text-muted-foreground">
                  Recibe actualizaciones por correo electrónico
                </p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={() => handleNotificationChange('email')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Alertas de Sistema</label>
                <p className="text-sm text-muted-foreground">
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
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Modo Oscuro</label>
                <p className="text-sm text-muted-foreground">
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
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                type="password"
                label="Contraseña Actual"
                value={password.current}
                onChange={(e) => setPassword(prev => ({ ...prev, current: e.target.value }))}
                leftIcon={<Lock size={18} />}
                required
              />
              
              <Input
                type="password"
                label="Nueva Contraseña"
                value={password.new}
                onChange={(e) => setPassword(prev => ({ ...prev, new: e.target.value }))}
                leftIcon={<Lock size={18} />}
                required
              />
              
              <Input
                type="password"
                label="Confirmar Nueva Contraseña"
                value={password.confirm}
                onChange={(e) => setPassword(prev => ({ ...prev, confirm: e.target.value }))}
                leftIcon={<Lock size={18} />}
                required
              />
              
              <Button type="submit">
                Cambiar Contraseña
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};