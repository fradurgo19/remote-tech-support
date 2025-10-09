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
    console.log('WebRTC Native: Service created');
  }

  private setupSocketListeners(): void {
    console.log('WebRTC Native: Setting up socket listeners...');
    console.log('WebRTC Native: Socket connected?', socketService.isConnected());
    console.log('WebRTC Native: Socket available?', socketService.isServerAvailableStatus());
    
    const unsubscribe = socketService.onSignal((data: { from: string; signal: any }) => {
      console.log('WebRTC Native: ✅ Signal received via socket:', {
        from: data.from,
        signalType: data.signal?.type,
      });
      this.handleSignal(data.from, data.signal);
    });
    
    console.log('WebRTC Native: Socket listeners configured, unsubscribe function:', typeof unsubscribe);
  }

  async initialize(user: User): Promise<void> {
    this.user = user;
    console.log('WebRTC Native: Initialized with user:', user.name);
    
    // Configurar listeners DESPUÉS de que el usuario esté autenticado y el socket conectado
    this.setupSocketListeners();
  }

  async getLocalStream(
    video: boolean = true,
    audio: boolean = true
  ): Promise<MediaStream> {
    try {
      console.log('WebRTC Native: Getting local stream...');
      const constraints: MediaStreamConstraints = {
        video: video ? { width: 1280, height: 720 } : false,
        audio: audio,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStream = stream;
      console.log('WebRTC Native: Local stream obtained:', {
        id: stream.id,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
      });
      return stream;
    } catch (error) {
      console.error('WebRTC Native: Error getting local stream:', error);
      throw error;
    }
  }

  createPeerConnection(peerId: string, initiator: boolean): RTCPeerConnection {
    console.log('WebRTC Native: Creating peer connection:', {
      peerId,
      initiator,
    });

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
      });
    }

    // Handle remote stream
    peerConnection.ontrack = event => {
      console.log('WebRTC Native: Remote track received:', event);
      const remoteStream = event.streams[0];
      if (remoteStream) {
        this.onStreamCallbacks.forEach(callback =>
          callback({ peerId, stream: remoteStream })
        );
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        console.log('WebRTC Native: Sending ICE candidate:', event.candidate);
        socketService.sendSignal(peerId, {
          type: 'candidate',
          candidate: event.candidate,
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(
        'WebRTC Native: Connection state:',
        peerConnection.connectionState
      );
      if (peerConnection.connectionState === 'failed') {
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

    console.log(
      'WebRTC Native: Initiating call to:',
      recipientId,
      'ticket:',
      ticketId
    );
    console.log(
      'WebRTC Native: Socket connected?',
      socketService.isConnected()
    );

    if (!this.localStream) {
      this.localStream = await this.getLocalStream();
    }

    console.log('WebRTC Native: Calling socketService.initiateCall');
    socketService.initiateCall(recipientId, ticketId);

    console.log('WebRTC Native: Creating peer connection');
    const peerConnection = this.createPeerConnection(recipientId, true);

    // Create offer
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      console.log('WebRTC Native: Sending offer:', offer);
      socketService.sendSignal(recipientId, {
        type: 'offer',
        sdp: offer.sdp,
      });
    } catch (error) {
      console.error('WebRTC Native: Error creating offer:', error);
      throw error;
    }

    console.log('WebRTC Native: Call initiation completed');
  }

  async acceptCall(callerId: string): Promise<void> {
    console.log('WebRTC Native: Accepting call from:', callerId);

    if (!this.localStream) {
      this.localStream = await this.getLocalStream();
    }

    console.log('WebRTC Native: Local stream ready');
    
    // Procesar señales pendientes (que llegaron antes de aceptar)
    const pendingSignals = this.pendingSignals.get(callerId);
    if (pendingSignals && pendingSignals.length > 0) {
      console.log(`WebRTC Native: Processing ${pendingSignals.length} buffered signals for ${callerId}`);
      
      // Procesar cada señal en orden
      for (const signal of pendingSignals) {
        console.log('WebRTC Native: Processing buffered signal:', signal.type);
        await this.handleSignal(callerId, signal);
      }
      
      // Limpiar buffer
      this.pendingSignals.delete(callerId);
      console.log('WebRTC Native: All buffered signals processed');
    } else {
      console.log('WebRTC Native: No pending signals to process');
    }
    
    // Verificar si ya existe PeerConnection
    const existing = this.peerConnections.get(callerId);
    if (existing) {
      console.log('WebRTC Native: PeerConnection exists after processing signals');
    } else {
      console.log('WebRTC Native: No PeerConnection yet, waiting for signals...');
    }
  }

  private async handleSignal(peerId: string, signal: any): Promise<void> {
    console.log(
      'WebRTC Native: Handling signal from:',
      peerId,
      'type:',
      signal.type
    );

    let peerConnection = this.peerConnections.get(peerId);

    if (!peerConnection) {
      console.log('WebRTC Native: No peer connection exists for:', peerId);
      console.log('WebRTC Native: Current peer connections:', Array.from(this.peerConnections.keys()));
      
      // Si no tenemos localStream, almacenar la señal para procesar después
      if (!this.localStream) {
        console.log('WebRTC Native: No local stream yet, buffering signal');
        if (!this.pendingSignals.has(peerId)) {
          this.pendingSignals.set(peerId, []);
        }
        this.pendingSignals.get(peerId)!.push(signal);
        console.log(`WebRTC Native: Signal buffered. Total pending for ${peerId}:`, this.pendingSignals.get(peerId)!.length);
        return;
      }
      
      console.log('WebRTC Native: Creating new peer connection for:', peerId);
      peerConnection = this.createPeerConnection(peerId, false);
    }

    try {
      if (signal.type === 'offer') {
        console.log('WebRTC Native: Processing offer');
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription({
            type: 'offer',
            sdp: signal.sdp,
          })
        );

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        console.log('WebRTC Native: Sending answer:', answer);
        socketService.sendSignal(peerId, {
          type: 'answer',
          sdp: answer.sdp,
        });
      } else if (signal.type === 'answer') {
        console.log('WebRTC Native: Processing answer');
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription({
            type: 'answer',
            sdp: signal.sdp,
          })
        );
      } else if (signal.type === 'candidate') {
        console.log('WebRTC Native: Processing ICE candidate');
        await peerConnection.addIceCandidate(signal.candidate);
      }
    } catch (error) {
      console.error('WebRTC Native: Error handling signal:', error);
    }
  }

  private handlePeerDisconnect(peerId: string): void {
    console.log('WebRTC Native: Handling peer disconnect:', peerId);
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
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: true,
      });

      // Replace video track in all peer connections
      const videoTrack = newStream.getVideoTracks()[0];
      this.peerConnections.forEach(peerConnection => {
        const sender = peerConnection
          .getSenders()
          .find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Stop old video tracks
      if (this.localStream) {
        this.localStream.getVideoTracks().forEach(track => track.stop());
      }

      // Update local stream
      this.localStream = newStream;
      console.log('WebRTC Native: Camera switched successfully');
    } catch (error) {
      console.error('WebRTC Native: Error switching camera:', error);
      throw error;
    }
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
