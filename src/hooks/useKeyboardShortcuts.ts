import { useEffect } from 'react';

export interface KeyboardShortcuts {
  toggleMute?: () => void;
  toggleVideo?: () => void;
  endCall?: () => void;
  toggleScreenShare?: () => void;
  acceptCall?: () => void;
  rejectCall?: () => void;
}

export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcuts,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Solo funcionar si se presiona Ctrl o Cmd
      const isMod = e.ctrlKey || e.metaKey;

      // Ignorar si el usuario está escribiendo en un input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Atajos con modificador (Ctrl/Cmd)
      if (isMod) {
        switch (e.key.toLowerCase()) {
          case 'm':
            e.preventDefault();
            shortcuts.toggleMute?.();
            console.log('🎹 Atajo: Toggle Mute (Ctrl+M)');
            break;
          case 'd':
            e.preventDefault();
            shortcuts.toggleVideo?.();
            console.log('🎹 Atajo: Toggle Video (Ctrl+D)');
            break;
          case 'e':
            e.preventDefault();
            shortcuts.endCall?.();
            console.log('🎹 Atajo: End Call (Ctrl+E)');
            break;
          case 's':
            e.preventDefault();
            shortcuts.toggleScreenShare?.();
            console.log('🎹 Atajo: Toggle Screen Share (Ctrl+S)');
            break;
        }
      }

      // Atajos sin modificador (solo cuando hay llamada entrante)
      if (!isMod && shortcuts.acceptCall && shortcuts.rejectCall) {
        switch (e.key.toLowerCase()) {
          case 'a':
            e.preventDefault();
            shortcuts.acceptCall();
            console.log('🎹 Atajo: Accept Call (A)');
            break;
          case 'r':
            e.preventDefault();
            shortcuts.rejectCall();
            console.log('🎹 Atajo: Reject Call (R)');
            break;
        }
      }

      // Atajo Escape para rechazar llamada
      if (e.key === 'Escape' && shortcuts.rejectCall) {
        e.preventDefault();
        shortcuts.rejectCall();
        console.log('🎹 Atajo: Reject Call (Escape)');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [shortcuts, enabled]);
};

// Hook para mostrar los atajos disponibles
export const useShowShortcutHints = (isInCall: boolean) => {
  const getShortcutHints = () => {
    const hints = [
      { key: 'Ctrl+M', action: 'Silenciar/Activar Micrófono' },
      { key: 'Ctrl+D', action: 'Activar/Desactivar Cámara' },
      { key: 'Ctrl+S', action: 'Compartir Pantalla' },
      { key: 'Ctrl+E', action: 'Finalizar Llamada' },
    ];

    if (!isInCall) {
      hints.push(
        { key: 'A', action: 'Aceptar Llamada Entrante' },
        { key: 'R / Esc', action: 'Rechazar Llamada' }
      );
    }

    return hints;
  };

  return { shortcuts: getShortcutHints() };
};
