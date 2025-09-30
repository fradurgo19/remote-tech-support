import { Keyboard, X } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { Card, CardContent } from '../atoms/Card';
import { cn } from '../utils/cn';

interface Shortcut {
  key: string;
  action: string;
  category: 'call' | 'controls' | 'incoming';
}

const shortcuts: Shortcut[] = [
  // Controles de llamada
  { key: 'Ctrl+M', action: 'Silenciar/Activar Micrófono', category: 'controls' },
  { key: 'Ctrl+D', action: 'Activar/Desactivar Cámara', category: 'controls' },
  { key: 'Ctrl+S', action: 'Compartir Pantalla', category: 'controls' },
  { key: 'Ctrl+E', action: 'Finalizar Llamada', category: 'call' },
  
  // Llamadas entrantes
  { key: 'A', action: 'Aceptar Llamada Entrante', category: 'incoming' },
  { key: 'R', action: 'Rechazar Llamada', category: 'incoming' },
  { key: 'Esc', action: 'Cerrar/Rechazar Llamada', category: 'incoming' },
];

interface KeyboardShortcutsHelpProps {
  className?: string;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getCategoryLabel = (category: Shortcut['category']): string => {
    switch (category) {
      case 'call':
        return 'Gestión de Llamada';
      case 'controls':
        return 'Controles';
      case 'incoming':
        return 'Llamada Entrante';
    }
  };

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<Shortcut['category'], Shortcut[]>);

  return (
    <>
      {/* Botón para abrir */}
      <Button
        variant='ghost'
        size='sm'
        onClick={() => setIsOpen(!isOpen)}
        className={cn('flex items-center gap-2', className)}
        title='Atajos de Teclado (Ayuda)'
      >
        <Keyboard size={16} />
        <span className='text-xs'>Atajos</span>
      </Button>

      {/* Modal/Panel de ayuda */}
      {isOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <Card className='w-full max-w-lg'>
            <CardContent className='p-6'>
              {/* Header */}
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  <Keyboard size={20} className='text-blue-600' />
                  <h3 className='text-lg font-semibold'>
                    Atajos de Teclado
                  </h3>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setIsOpen(false)}
                  className='h-8 w-8 p-0'
                >
                  <X size={16} />
                </Button>
              </div>

              {/* Shortcuts grouped by category */}
              <div className='space-y-4'>
                {Object.entries(groupedShortcuts).map(([category, items]) => (
                  <div key={category}>
                    <h4 className='text-sm font-semibold text-gray-700 mb-2'>
                      {getCategoryLabel(category as Shortcut['category'])}
                    </h4>
                    <div className='space-y-2'>
                      {items.map((shortcut, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between p-2 bg-gray-50 rounded-md'
                        >
                          <span className='text-sm text-gray-700'>
                            {shortcut.action}
                          </span>
                          <kbd className='px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono shadow-sm'>
                            {shortcut.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Nota */}
              <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md'>
                <p className='text-xs text-blue-800'>
                  💡 <strong>Nota:</strong> Los atajos con Ctrl también funcionan
                  con Cmd en Mac. Los atajos de llamada entrante solo están
                  disponibles cuando hay una llamada activa.
                </p>
              </div>

              {/* Footer */}
              <div className='mt-4 flex justify-end'>
                <Button onClick={() => setIsOpen(false)}>Cerrar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

// Versión compacta para mostrar en tooltip
export const ShortcutHint: React.FC<{ shortcut: string; className?: string }> = ({
  shortcut,
  className,
}) => {
  return (
    <kbd
      className={cn(
        'px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] font-mono',
        className
      )}
    >
      {shortcut}
    </kbd>
  );
};
