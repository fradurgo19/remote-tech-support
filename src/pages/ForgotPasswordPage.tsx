import { AlertCircle, ArrowLeft, CheckCircle, KeyRound, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { authService } from '../services/api';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await authService.forgotPassword(email);
      setMessage(response.message);
      setError('');
    } catch {
      setError('Error al solicitar recuperación de contraseña');
      setMessage('');
    } finally {
      setIsLoading(false);
    }
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

      <div className='w-full max-w-md p-8 space-y-8 bg-card shadow-lg rounded-xl border border-border'>
        <div className='text-center'>
          <div className='mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center'>
            <KeyRound size={28} className='text-primary' />
          </div>
          <h1 className='mt-4 text-2xl font-bold text-foreground'>
            Recuperar Contraseña
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
          </p>
        </div>

        {/* Mensaje de éxito */}
        {message && (
          <div className='p-3 rounded-md bg-success/10 text-success flex items-center gap-2 text-sm'>
            <CheckCircle size={16} />
            <span>{message}</span>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className='p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2 text-sm'>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-6'>
          <Input
            id='email'
            type='email'
            label='Email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder='tu@email.com'
            leftIcon={<Mail size={18} />}
            required
            disabled={isLoading}
          />

          <Button 
            type='submit' 
            className='w-full' 
            isLoading={isLoading}
          >
            Enviar Instrucciones
          </Button>
        </form>

        <button
          onClick={() => navigate('/login')}
          className='w-full mt-4 text-primary hover:underline font-medium flex items-center justify-center gap-2'
        >
          <ArrowLeft size={16} />
          Volver al login
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
