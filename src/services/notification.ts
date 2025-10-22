import { User } from '../types';

class NotificationService {
  private hasPermission = false;
  private ringtoneAudio: HTMLAudioElement | null = null;

  constructor() {
    this.checkPermission();
  }

  async checkPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones de escritorio');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    }

    return false;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    this.hasPermission = permission === 'granted';
    return this.hasPermission;
  }

  showIncomingCallNotification(
    caller: User,
    onAccept: () => void,
    onReject: () => void
  ): Notification | null {
    if (!this.hasPermission) {
      console.warn('No hay permisos para mostrar notificaciones');
      return null;
    }

    const notification = new Notification('📞 Llamada Entrante', {
      body: `${caller.name}\n${caller.email}`,
      icon: caller.avatar || '/logo.png',
      tag: 'incoming-call',
      requireInteraction: true,
      badge: '/logo.png',
      vibrate: [200, 100, 200],
      data: {
        callerId: caller.id,
        callerName: caller.name,
      },
    });

    // Reproducir sonido de llamada
    this.playRingtone();

    notification.onclick = () => {
      window.focus();
      onAccept();
      notification.close();
      this.stopRingtone();
    };

    // Auto-cerrar después de 30 segundos
    setTimeout(() => {
      notification.close();
      this.stopRingtone();
      // No rechazamos automáticamente, solo cerramos la notificación
      // El modal en la app seguirá abierto
    }, 30000);

    return notification;
  }

  showCallAcceptedNotification(caller: User): void {
    if (!this.hasPermission) return;

    const notification = new Notification('✅ Llamada Iniciada', {
      body: `Conectado con ${caller.name}`,
      icon: caller.avatar || '/logo.png',
      tag: 'call-accepted',
      requireInteraction: false,
    });

    setTimeout(() => {
      notification.close();
    }, 3000);
  }

  showCallRejectedNotification(caller: User): void {
    if (!this.hasPermission) return;

    const notification = new Notification('❌ Llamada Rechazada', {
      body: `${caller.name} rechazó la llamada`,
      icon: caller.avatar || '/logo.png',
      tag: 'call-rejected',
      requireInteraction: false,
    });

    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  showCallEndedNotification(duration: number): void {
    if (!this.hasPermission) return;

    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const durationText =
      minutes > 0
        ? `${minutes}m ${seconds}s`
        : `${seconds}s`;

    const notification = new Notification('📞 Llamada Finalizada', {
      body: `Duración: ${durationText}`,
      tag: 'call-ended',
      requireInteraction: false,
    });

    setTimeout(() => {
      notification.close();
    }, 3000);
  }

  showCallErrorNotification(error: string): void {
    if (!this.hasPermission) return;

    const notification = new Notification('⚠️ Error en la Llamada', {
      body: error,
      tag: 'call-error',
      requireInteraction: false,
    });

    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  playRingtone(): void {
    // Crear un tono simple usando Web Audio API
    try {
      if (!this.ringtoneAudio) {
        this.ringtoneAudio = new Audio();
        // Usar un tono de data URI simple (opcional: reemplazar con archivo real)
        // Por ahora, solo usamos la notificación del navegador
      }

      // Si tienes un archivo de audio, descomenta esto:
      // this.ringtoneAudio.src = '/sounds/ringtone.mp3';
      // this.ringtoneAudio.loop = true;
      // this.ringtoneAudio.play();
    } catch (error) {
      console.error('Error playing ringtone:', error);
    }
  }

  stopRingtone(): void {
    if (this.ringtoneAudio) {
      this.ringtoneAudio.pause();
      this.ringtoneAudio.currentTime = 0;
    }
  }

  // Cerrar todas las notificaciones activas
  closeAllNotifications(): void {
    // No hay una API directa para cerrar todas las notificaciones
    // pero podemos mantener referencias si es necesario
  }
}

export const notificationService = new NotificationService();
