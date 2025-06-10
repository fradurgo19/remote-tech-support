import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Headset, Mail, Lock, AlertCircle, ChevronDown } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { useAuth } from '../context/AuthContext';
import { Select } from '../atoms/Select';

const DEMO_USERS = [
  { email: 'analista.mantenimiento@partequipos.com', name: 'Soporte al Producto (Administrador)' },
  { email: 'auxiliar.garantiasbg@partequipos.com', name: 'Juan Técnico' },
  { email: 'miguel@empresa.com', name: 'Miguel Usuario (Cliente)' },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState(DEMO_USERS[0].email);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
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
    setEmail(e.target.value);
    setPassword(''); // Limpiar la contraseña al cambiar de usuario
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="w-full max-w-md p-8 space-y-8 bg-card shadow-lg rounded-xl border border-border">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Headset size={28} className="text-primary" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Plataforma de Soporte Técnico</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inicia sesión en tu cuenta para continuar
          </p>
        </div>
        
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">
                Seleccionar Usuario
              </label>
              <Select
                value={email}
                onChange={handleUserChange}
                leftIcon={<Mail size={18} />}
              >
                {DEMO_USERS.map(user => (
                  <option key={user.email} value={user.email}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </div>
            
            <Input
              id="password"
              type="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock size={18} />}
              required
            />
          </div>
          
          <div>
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Iniciar Sesión
            </Button>
          </div>
        </form>
        
        <div className="text-center text-xs text-muted-foreground">
          <p>Para propósitos de demostración, usa:</p>
          <p className="mt-1">Email: john@techsupport.com</p>
          <p>Contraseña: password</p>
        </div>
      </div>
    </div>
  );
};