import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Componente helper que escucha eventos personalizados para navegar
 * sin recargar la página. Debe estar dentro del Router.
 */
export const NavigationHelper: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleNavigate = (event: CustomEvent<string>) => {
      const path = event.detail;
      console.log('🧭 NavigationHelper: Navigating to', path);
      navigate(path, { replace: false });
    };

    // Escuchar eventos personalizados de navegación
    window.addEventListener(
      'navigate-to' as any,
      handleNavigate as EventListener
    );

    return () => {
      window.removeEventListener(
        'navigate-to' as any,
        handleNavigate as EventListener
      );
    };
  }, [navigate]);

  return null;
};

/**
 * Función helper para navegar sin recargar la página
 * Dispara un evento personalizado que es escuchado por NavigationHelper
 */
export const navigateTo = (path: string) => {
  console.log('🧭 navigateTo: Requesting navigation to', path);
  window.dispatchEvent(new CustomEvent('navigate-to', { detail: path }));
};
