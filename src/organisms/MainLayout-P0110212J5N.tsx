import {
  FileText,
  Headphones,
  Headset,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  Users,
  X,
} from 'lucide-react';
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Avatar } from '../atoms/Avatar';
import { Button } from '../atoms/Button';
import { useAuth } from '../context/AuthContext';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Alternar modo oscuro
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/',
      icon: <LayoutDashboard size={20} />,
      label: 'Panel Principal',
    },
    { path: '/tickets', icon: <MessageSquare size={20} />, label: 'Tickets' },
    { path: '/support', icon: <Headphones size={20} />, label: 'Soporte' },
    { path: '/reports', icon: <FileText size={20} />, label: 'Informes' },
    { path: '/users', icon: <Users size={20} />, label: 'Usuarios' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Configuración' },
  ];

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      {/* Encabezado */}
      <header className='bg-background border-b border-border z-10'>
        <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
          {/* Logo */}
          <div className='flex items-center space-x-3'>
            <Button
              variant='ghost'
              size='icon'
              className='md:hidden mr-2'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>

            {/* Logo de la compañía */}
            <img
              src='https://res.cloudinary.com/dbufrzoda/image/upload/v1750457354/Captura_de_pantalla_2025-06-20_170819_wzmyli.png'
              alt='Partequipos Logo'
              className='h-10 w-auto object-contain'
            />

            <NavLink to='/' className='flex items-center space-x-2'>
              <Headset size={24} className='text-primary' />
              <span className='font-bold text-lg hidden sm:inline-block'>
                SoporteTécnico
              </span>
            </NavLink>
          </div>

          {/* Controles del lado derecho */}
          <div className='flex items-center space-x-3'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setDarkMode(!darkMode)}
              aria-label={
                darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
              }
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>

            {user && (
              <div className='flex items-center space-x-2'>
                <div className='hidden md:block text-right mr-2'>
                  <p className='text-sm font-medium'>{user.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {user.role === 'admin'
                      ? 'Administrador'
                      : user.role === 'technician'
                      ? 'Técnico'
                      : 'Cliente'}
                  </p>
                </div>
                <Avatar src={user.avatar} status={user.status} />

                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleLogout}
                  aria-label='Cerrar sesión'
                  className='hidden md:flex'
                >
                  <LogOut size={18} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className='flex flex-1 overflow-hidden'>
        {/* Barra lateral - Escritorio */}
        <aside className='hidden md:flex flex-col w-64 bg-card border-r border-border p-4 overflow-y-auto'>
          <nav className='space-y-1 mt-4 flex-1'>
            {menuItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-md transition-colors',
                    {
                      'bg-primary/10 text-primary font-medium': isActive,
                      'text-foreground hover:bg-muted': !isActive,
                    }
                  )
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className='mt-auto pt-4 border-t border-border'>
            <Button
              variant='ghost'
              className='w-full justify-start'
              onClick={handleLogout}
              leftIcon={<LogOut size={18} />}
            >
              Cerrar Sesión
            </Button>
          </div>
        </aside>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className='md:hidden absolute inset-0 z-20 bg-background flex flex-col'>
            <div className='p-4 border-b border-border flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <Headset size={24} className='text-primary' />
                <span className='font-bold text-lg'>SoporteTécnico</span>
              </div>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={20} />
              </Button>
            </div>

            <nav className='flex-1 p-4 overflow-y-auto'>
              {menuItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center space-x-3 px-3 py-3 rounded-md transition-colors mb-2',
                      {
                        'bg-primary/10 text-primary font-medium': isActive,
                        'text-foreground hover:bg-muted': !isActive,
                      }
                    )
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className='p-4 border-t border-border'>
              <Button
                variant='ghost'
                className='w-full justify-start'
                onClick={handleLogout}
                leftIcon={<LogOut size={18} />}
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <main className='flex-1 overflow-auto bg-background'>
          <div className='container mx-auto p-4 h-full'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

// Función auxiliar para nombres de clase condicionales
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
