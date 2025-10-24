import { User } from '../types';
import { socketService } from './socket';

export interface PeerStreamData {
  peerId: string;
  stream: MediaStream;
}

export interface MediaDevice {
  deviceId: string;
  label: string;
  kind: 'videoinput' | 'audioinput' | 'audiooutput';
}

class WebRTCNativeService {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private user: User | null = null;
  private screenStream: MediaStream | null = null;
  private multipleCameraStreams: Map<string, MediaStream> = new Map();
  private activeCameraStreams: string[] = [];
  private onStreamCallbacks: ((data: PeerStreamData) => void)[] = [];
  private onDeviceCallbacks: ((devices: MediaDevice[]) => void)[] = [];
  private pendingSignals: Map<string, any[]> = new Map(); // Buffer de señales pendientes

  constructor() {
    // NO configurar listeners aquí - el socket puede no estar listo
  }

  private setupSocketListeners(): void {
    socketService.onSignal((data: { from: string; signal: any }) => {
      this.handleSignal(data.from, data.signal);
    });
  }

  async initialize(user: User): Promise<void> {
    this.user = user;

    // Configurar listeners DESPUÉS de que el usuario esté autenticado y el socket conectado
    this.setupSocketListeners();
  }

  getLocalStreamInstance(): MediaStream | null {
    return this.localStream;
  }

  async getLocalStream(
    video: boolean = true,
    audio: boolean = true,
    preferredFacingMode: 'user' | 'environment' = 'environment' // Preferir cámara trasera por defecto
  ): Promise<MediaStream> {
    try {
      // Detectar si es móvil
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      const constraints: MediaStreamConstraints = {
        video: video
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: isMobile ? preferredFacingMode : undefined, // Solo aplicar facingMode en móviles
            }
          : false,
        audio: audio
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : false,
      };

      console.log(
        'WebRTC: Solicitando stream local con constraints:',
        constraints
      );
      console.log(
        'WebRTC: Es móvil:',
        isMobile,
        'FacingMode preferido:',
        preferredFacingMode
      );

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Verificar tracks obtenidos
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      console.log(
        `WebRTC: Stream local obtenido - Video tracks: ${videoTracks.length}, Audio tracks: ${audioTracks.length}`
      );

      // Log de la cámara actual en móvil
      if (videoTracks.length > 0) {
        const settings = videoTracks[0].getSettings();
        console.log('WebRTC: Cámara activa:', {
          facingMode: settings.facingMode,
          deviceId: settings.deviceId,
          width: settings.width,
          height: settings.height,
        });
      }

      audioTracks.forEach((track, index) => {
        console.log(
          `WebRTC: Audio track local ${index} - Enabled: ${track.enabled}, ReadyState: ${track.readyState}`
        );
      });

      this.localStream = stream;
      return stream;
    } catch (error) {
      console.error('Error al obtener stream local:', error);
      throw error;
    }
  }

  createPeerConnection(peerId: string, initiator: boolean): RTCPeerConnection {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
        console.log(
          `WebRTC: Track agregado - Tipo: ${track.kind}, Enabled: ${track.enabled}, Estado: ${track.readyState}`
        );
      });
    }

    // Handle remote stream
    peerConnection.ontrack = event => {
      console.log(
        `WebRTC: Remote track recibido - Tipo: ${event.track.kind}, Enabled: ${event.track.enabled}, Estado: ${event.track.readyState}`
      );
      const remoteStream = event.streams[0];
      if (remoteStream) {
        // Verificar todos los tracks del stream remoto
        const videoTracks = remoteStream.getVideoTracks();
        const audioTracks = remoteStream.getAudioTracks();
        console.log(
          `WebRTC: Stream remoto - Video tracks: ${videoTracks.length}, Audio tracks: ${audioTracks.length}`
        );

        audioTracks.forEach((track, index) => {
          console.log(
            `WebRTC: Audio track ${index} - Enabled: ${track.enabled}, Muted: ${track.muted}, ReadyState: ${track.readyState}`
          );
        });

        this.onStreamCallbacks.forEach(callback =>
          callback({ peerId, stream: remoteStream })
        );
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        socketService.sendSignal(peerId, {
          type: 'candidate',
          candidate: event.candidate,
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'failed') {
        console.error('Conexión WebRTC falló');
        this.handlePeerDisconnect(peerId);
      }
    };

    this.peerConnections.set(peerId, peerConnection);
    return peerConnection;
  }

  async initiateCall(recipientId: string, ticketId: string): Promise<void> {
    if (!this.user) {
      throw new Error('User not initialized');
    }

    if (!this.localStream) {
      this.localStream = await this.getLocalStream();
    }

    socketService.initiateCall(recipientId, ticketId);

    const peerConnection = this.createPeerConnection(recipientId, true);

    // Create offer
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socketService.sendSignal(recipientId, {
        type: 'offer',
        sdp: offer.sdp,
      });
    } catch (error) {
      console.error('Error al crear offer WebRTC:', error);
      throw error;
    }
  }

  async acceptCall(callerId: string): Promise<void> {
    if (!this.localStream) {
      this.localStream = await this.getLocalStream();
    }

    // Crear la conexión primero si no existe
    if (!this.peerConnections.has(callerId)) {
      console.log('🔗 Creating peer connection for caller:', callerId);
      this.createPeerConnection(callerId, false);
    }

    // Procesar señales pendientes (que llegaron antes de aceptar)
    const pendingSignals = this.pendingSignals.get(callerId);
    if (pendingSignals && pendingSignals.length > 0) {
      console.log(`📦 Processing ${pendingSignals.length} pending signals for:`, callerId);
      // Procesar cada señal en orden
      for (const signal of pendingSignals) {
        await this.handleSignal(callerId, signal);
      }

      // Limpiar buffer
      this.pendingSignals.delete(callerId);
    }
  }

  private async handleSignal(peerId: string, signal: any): Promise<void> {
    let peerConnection = this.peerConnections.get(peerId);

    if (!peerConnection) {
      // Si no tenemos localStream, almacenar la señal para procesar después
      if (!this.localStream) {
        console.log('⏳ No local stream yet, storing signal for:', peerId);
        if (!this.pendingSignals.has(peerId)) {
          this.pendingSignals.set(peerId, []);
        }
        this.pendingSignals.get(peerId)!.push(signal);
        return;
      }

      peerConnection = this.createPeerConnection(peerId, false);
    }

    try {
      console.log(`📡 Processing ${signal.type} signal from:`, peerId);
      
      if (signal.type === 'offer') {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription({
            type: 'offer',
            sdp: signal.sdp,
          })
        );

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        console.log('✅ Answer created and sent to:', peerId);
        socketService.sendSignal(peerId, {
          type: 'answer',
          sdp: answer.sdp,
        });
      } else if (signal.type === 'answer') {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription({
            type: 'answer',
            sdp: signal.sdp,
          })
        );
        console.log('✅ Answer received and set for:', peerId);
      } else if (signal.type === 'candidate') {
        // Solo añadir candidatos si la conexión está en estado válido
        if (peerConnection.remoteDescription) {
          await peerConnection.addIceCandidate(signal.candidate);
          console.log('✅ ICE candidate added for:', peerId);
        } else {
          console.log('⏳ Storing ICE candidate for later:', peerId);
          // Almacenar candidatos pendientes si no hay remoteDescription aún
          if (!this.pendingSignals.has(peerId)) {
            this.pendingSignals.set(peerId, []);
          }
          this.pendingSignals.get(peerId)!.push(signal);
        }
      }
    } catch (error) {
      console.error('❌ Error al procesar señal WebRTC:', error);
      console.error('Signal type:', signal.type);
      console.error('Peer ID:', peerId);
    }
  }

  private handlePeerDisconnect(peerId: string): void {
    const peerConnection = this.peerConnections.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(peerId);
    }
  }

  // Stream management methods
  onStream(callback: (data: PeerStreamData) => void): () => void {
    this.onStreamCallbacks.push(callback);
    return () => {
      const index = this.onStreamCallbacks.indexOf(callback);
      if (index > -1) {
        this.onStreamCallbacks.splice(index, 1);
      }
    };
  }

  onDevices(callback: (devices: MediaDevice[]) => void): () => void {
    this.onDeviceCallbacks.push(callback);
    return () => {
      const index = this.onDeviceCallbacks.indexOf(callback);
      if (index > -1) {
        this.onDeviceCallbacks.splice(index, 1);
      }
    };
  }

  async getAvailableDevices(): Promise<MediaDevice[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mediaDevices: MediaDevice[] = devices
        .filter(
          device =>
            device.kind === 'videoinput' ||
            device.kind === 'audioinput' ||
            device.kind === 'audiooutput'
        )
        .map(device => ({
          deviceId: device.deviceId,
          label:
            device.label || `${device.kind} ${device.deviceId.slice(0, 8)}`,
          kind: device.kind as 'videoinput' | 'audioinput' | 'audiooutput',
        }));

      this.onDeviceCallbacks.forEach(callback => callback(mediaDevices));
      return mediaDevices;
    } catch (error) {
      console.error('WebRTC Native: Error getting devices:', error);
      return [];
    }
  }

  async switchCamera(deviceId: string): Promise<void> {
    console.log('WebRTC Native: Switching camera to:', deviceId);

    if (!this.localStream) {
      throw new Error('No local stream available');
    }

    try {
      // Intentar primero con deviceId exacto
      let newStream: MediaStream;

      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId } },
          audio: true,
        });
      } catch (err) {
        // Si falla con exact, intentar sin exact (útil para móviles)
        console.log('WebRTC: Reintentando sin deviceId exacto...');
        newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: deviceId },
          audio: true,
        });
      }

      console.log('WebRTC: Nuevo stream obtenido');

      // Verificar la cámara seleccionada
      const videoTrack = newStream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        console.log('WebRTC: Nueva cámara activa:', {
          facingMode: settings.facingMode,
          deviceId: settings.deviceId,
          label: videoTrack.label,
        });
      }

      // Replace video track in all peer connections
      this.peerConnections.forEach(peerConnection => {
        const sender = peerConnection
          .getSenders()
          .find(s => s.track?.kind === 'video');
        if (sender && videoTrack) {
          console.log('WebRTC: Reemplazando track de video en peer connection');
          sender.replaceTrack(videoTrack);
        }
      });

      // Stop old video tracks
      if (this.localStream) {
        this.localStream.getVideoTracks().forEach(track => {
          console.log(
            'WebRTC: Deteniendo track de video anterior:',
            track.label
          );
          track.stop();
        });
      }

      // Update local stream (mantener audio tracks antiguos, solo cambiar video)
      const oldAudioTracks = this.localStream.getAudioTracks();
      const newVideoTracks = newStream.getVideoTracks();

      // Crear nuevo stream con video nuevo y audio antiguo
      this.localStream = new MediaStream([
        ...newVideoTracks,
        ...oldAudioTracks,
      ]);

      console.log('WebRTC Native: Camera switched successfully');
    } catch (error) {
      console.error('WebRTC Native: Error switching camera:', error);
      throw error;
    }
  }

  async switchToFrontCamera(): Promise<void> {
    console.log('🔄 WebRTC: Cambiando a cámara frontal');

    if (!this.localStream) {
      throw new Error('No hay stream local disponible');
    }

    try {
      // Enumerar dispositivos para encontrar la cámara frontal
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');

      console.log(
        '📹 Cámaras disponibles:',
        videoDevices.map(d => ({
          id: d.deviceId,
          label: d.label,
        }))
      );

      // Buscar cámara frontal por label o como primera opción
      const frontCamera =
        videoDevices.find(
          d =>
            d.label.toLowerCase().includes('front') ||
            d.label.toLowerCase().includes('frontal') ||
            d.label.toLowerCase().includes('user')
        ) || videoDevices[0]; // Usar la primera si no se encuentra

      if (!frontCamera) {
        throw new Error('No se encontró cámara frontal');
      }

      console.log(
        '📱 Using front camera:',
        frontCamera.label,
        frontCamera.deviceId
      );

      // Detener el track de video actual
      const oldVideoTrack = this.localStream.getVideoTracks()[0];
      if (oldVideoTrack) {
        oldVideoTrack.stop();
      }

      // Obtener nuevo stream usando el deviceId (mantener audio para no perder permisos)
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: frontCamera.deviceId,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true, // Mantener audio para no perder permisos
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      const newAudioTracks = newStream.getAudioTracks();
      
      console.log('✅ Nuevo track obtenido:', newVideoTrack.getSettings());

      // Detener los tracks de audio del nuevo stream (no los necesitamos)
      newAudioTracks.forEach(track => track.stop());

      // Reemplazar track en peer connections
      this.peerConnections.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender && newVideoTrack) {
          sender.replaceTrack(newVideoTrack);
        }
      });

      // Actualizar localStream - mantener audio tracks originales
      const oldAudioTracks = this.localStream.getAudioTracks();
      this.localStream = new MediaStream([newVideoTrack, ...oldAudioTracks]);

      console.log('✅ Cambiado a cámara frontal exitosamente');
    } catch (error) {
      console.error('❌ Error cambiando a cámara frontal:', error);
      throw error;
    }
  }

  async switchToBackCamera(): Promise<void> {
    console.log('🔄 WebRTC: Cambiando a cámara trasera');

    if (!this.localStream) {
      throw new Error('No hay stream local disponible');
    }

    try {
      // Enumerar dispositivos para encontrar la cámara trasera
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');

      console.log(
        '📹 Cámaras disponibles:',
        videoDevices.map(d => ({
          id: d.deviceId,
          label: d.label,
        }))
      );

      // Buscar cámara trasera por label
      const backCamera =
        videoDevices.find(
          d =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('trasera') ||
            d.label.toLowerCase().includes('rear') ||
            d.label.toLowerCase().includes('environment')
        ) ||
        videoDevices[1] ||
        videoDevices[0]; // Usar la segunda o primera si no se encuentra

      if (!backCamera) {
        throw new Error('No se encontró cámara trasera');
      }

      console.log(
        '📱 Using back camera:',
        backCamera.label,
        backCamera.deviceId
      );

      // Detener el track de video actual
      const oldVideoTrack = this.localStream.getVideoTracks()[0];
      if (oldVideoTrack) {
        oldVideoTrack.stop();
      }

      // Obtener nuevo stream usando el deviceId (mantener audio para no perder permisos)
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: backCamera.deviceId,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true, // Mantener audio para no perder permisos
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      const newAudioTracks = newStream.getAudioTracks();
      
      console.log('✅ Nuevo track obtenido:', newVideoTrack.getSettings());

      // Detener los tracks de audio del nuevo stream (no los necesitamos)
      newAudioTracks.forEach(track => track.stop());

      // Reemplazar track en peer connections
      this.peerConnections.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender && newVideoTrack) {
          sender.replaceTrack(newVideoTrack);
        }
      });

      // Actualizar localStream - mantener audio tracks originales
      const oldAudioTracks = this.localStream.getAudioTracks();
      this.localStream = new MediaStream([newVideoTrack, ...oldAudioTracks]);

      console.log('✅ Cambiado a cámara trasera exitosamente');
    } catch (error) {
      console.error('❌ Error cambiando a cámara trasera:', error);
      throw error;
    }
  }

  private async replaceVideoTrack(newStream: MediaStream): Promise<void> {
    const videoTrack = newStream.getVideoTracks()[0];

    if (!videoTrack) {
      throw new Error('No se obtuvo track de video');
    }

    // Log de la nueva cámara
    const settings = videoTrack.getSettings();
    console.log('WebRTC: Track de video nuevo:', {
      facingMode: settings.facingMode,
      deviceId: settings.deviceId,
      label: videoTrack.label,
      width: settings.width,
      height: settings.height,
    });

    // Replace video track in all peer connections
    this.peerConnections.forEach(peerConnection => {
      const sender = peerConnection
        .getSenders()
        .find(s => s.track?.kind === 'video');
      if (sender) {
        console.log('WebRTC: Reemplazando track en peer connection');
        sender.replaceTrack(videoTrack);
      }
    });

    // Stop old video tracks
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        console.log('WebRTC: Deteniendo track anterior:', track.label);
        track.stop();
      });
    }

    // Update local stream (mantener audio tracks, cambiar solo video)
    const oldAudioTracks = this.localStream?.getAudioTracks() || [];
    this.localStream = new MediaStream([videoTrack, ...oldAudioTracks]);
  }

  async switchMicrophone(deviceId: string): Promise<void> {
    console.log('WebRTC Native: Switching microphone to:', deviceId);

    if (!this.localStream) {
      throw new Error('No local stream available');
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: { deviceId: { exact: deviceId } },
      });

      // Replace audio track in all peer connections
      const audioTrack = newStream.getAudioTracks()[0];
      this.peerConnections.forEach(peerConnection => {
        const sender = peerConnection
          .getSenders()
          .find(s => s.track?.kind === 'audio');
        if (sender) {
          sender.replaceTrack(audioTrack);
        }
      });

      // Stop old audio tracks
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach(track => track.stop());
      }

      // Update local stream
      this.localStream = newStream;
      console.log('WebRTC Native: Microphone switched successfully');
    } catch (error) {
      console.error('WebRTC Native: Error switching microphone:', error);
      throw error;
    }
  }

  async toggleVideo(): Promise<void> {
    if (!this.localStream) return;

    const videoTracks = this.localStream.getVideoTracks();
    if (videoTracks.length === 0) return;

    const isEnabled = videoTracks[0].enabled;
    videoTracks.forEach(track => {
      track.enabled = !isEnabled;
    });

    console.log('WebRTC Native: Video', isEnabled ? 'disabled' : 'enabled');
  }

  async toggleAudio(): Promise<void> {
    if (!this.localStream) return;

    const audioTracks = this.localStream.getAudioTracks();
    if (audioTracks.length === 0) return;

    const isEnabled = audioTracks[0].enabled;
    audioTracks.forEach(track => {
      track.enabled = !isEnabled;
    });

    console.log('WebRTC Native: Audio', isEnabled ? 'disabled' : 'enabled');
  }

  async startScreenSharing(): Promise<MediaStream | null> {
    try {
      console.log('WebRTC Native: Starting screen sharing');
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      // Replace video track in all peer connections
      if (this.screenStream && this.localStream) {
        const videoTrack = this.screenStream.getVideoTracks()[0];
        this.peerConnections.forEach(peerConnection => {
          const sender = peerConnection
            .getSenders()
            .find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });
      }

      return this.screenStream;
    } catch (error) {
      console.error('WebRTC Native: Error starting screen sharing:', error);
      return null;
    }
  }

  async stopScreenSharing(): Promise<void> {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());

      // Restore camera video track
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        this.peerConnections.forEach(peerConnection => {
          const sender = peerConnection
            .getSenders()
            .find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });
      }

      this.screenStream = null;
    }
  }

  // Multiple camera support
  async addCamera(deviceId: string): Promise<MediaStream | null> {
    try {
      if (this.activeCameraStreams.includes(deviceId)) {
        console.warn('WebRTC Native: Camera already active:', deviceId);
        return this.multipleCameraStreams.get(deviceId) || null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: false, // Only video for additional cameras
      });

      this.multipleCameraStreams.set(deviceId, stream);
      this.activeCameraStreams.push(deviceId);
      console.log(
        'WebRTC Native: Added camera:',
        deviceId,
        'Active cameras:',
        this.activeCameraStreams
      );
      return stream;
    } catch (error) {
      console.error('WebRTC Native: Error adding camera:', error);
      throw error;
    }
  }

  async removeCamera(deviceId: string): Promise<void> {
    const stream = this.multipleCameraStreams.get(deviceId);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      this.multipleCameraStreams.delete(deviceId);
      this.activeCameraStreams = this.activeCameraStreams.filter(
        id => id !== deviceId
      );
      console.log('WebRTC Native: Removed camera:', deviceId);
    }
  }

  async toggleCamera(deviceId: string): Promise<MediaStream | null> {
    if (this.activeCameraStreams.includes(deviceId)) {
      await this.removeCamera(deviceId);
      return null;
    } else {
      return await this.addCamera(deviceId);
    }
  }

  getActiveCameraStreams(): Map<string, MediaStream> {
    return this.multipleCameraStreams;
  }

  getActiveCameraIds(): string[] {
    return this.activeCameraStreams;
  }

  // Additional methods for compatibility
  endCall(): void {
    console.log('WebRTC Native: Ending call');
    this.cleanup();
  }

  startRecording(): void {
    console.log('WebRTC Native: Recording not implemented yet');
    // TODO: Implement recording functionality
  }

  stopRecording(): Promise<Blob> {
    console.log('WebRTC Native: Recording not implemented yet');
    return Promise.resolve(new Blob());
  }

  cleanup(): void {
    console.log('WebRTC Native: Cleaning up...');

    // Close all peer connections
    this.peerConnections.forEach(peerConnection => {
      peerConnection.close();
    });
    this.peerConnections.clear();

    // Stop all streams
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    // Stop multiple camera streams
    this.multipleCameraStreams.forEach(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    this.multipleCameraStreams.clear();
    this.activeCameraStreams = [];

    console.log('WebRTC Native: Cleanup completed');
  }

  // Get peer connection for stats
  getPeerConnection(peerId?: string): RTCPeerConnection | null {
    if (peerId) {
      return this.peerConnections.get(peerId) || null;
    }
    // If no peerId specified, return the first peer connection
    const firstConnection = Array.from(this.peerConnections.values())[0];
    return firstConnection || null;
  }

  // Get all peer connections
  getAllPeerConnections(): RTCPeerConnection[] {
    return Array.from(this.peerConnections.values());
  }
}

export const webRTCNativeService = new WebRTCNativeService();
