import SimplePeer from 'simple-peer';
import { socketService } from './socket';
import { User } from '../types';

export interface PeerStreamData {
  peerId: string;
  stream: MediaStream;
}

export interface MediaDevice {
  deviceId: string;
  label: string;
  kind: 'videoinput' | 'audioinput' | 'audiooutput';
}

class WebRTCService {
  private localStream: MediaStream | null = null;
  private peers: Map<string, SimplePeer.Instance> = new Map();
  private user: User | null = null;
  private screenStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: BlobPart[] = [];
  private availableDevices: MediaDevice[] = [];
  private currentVideoDeviceId: string | null = null;
  private currentAudioDeviceId: string | null = null;

  private onStreamCallbacks: ((data: PeerStreamData) => void)[] = [];
  private onStreamRemoveCallbacks: ((peerId: string) => void)[] = [];
  private onDevicesChangeCallbacks: ((devices: MediaDevice[]) => void)[] = [];
  
  initialize(user: User): void {
    this.user = user;
    this.setupSignalListeners();
    this.setupDeviceChangeListener();
    this.enumerateDevices();
  }

  private setupSignalListeners(): void {
    socketService.onSignal((data) => {
      const { from, signal } = data;
      
      // If we already have a peer for this user
      if (this.peers.has(from)) {
        const peer = this.peers.get(from);
        peer?.signal(signal);
      } else if (this.localStream) {
        // If not, create a new peer (as the receiver of the call)
        this.createPeer(from, false, this.localStream);
      }
    });
  }

  private setupDeviceChangeListener(): void {
    navigator.mediaDevices.addEventListener('devicechange', () => {
      this.enumerateDevices();
    });
  }

  async enumerateDevices(): Promise<MediaDevice[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableDevices = devices
        .filter(device => device.kind === 'videoinput' || device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `${device.kind === 'videoinput' ? 'Camera' : 'Microphone'} ${device.deviceId.slice(0, 8)}`,
          kind: device.kind as 'videoinput' | 'audioinput'
        }));
      
      this.onDevicesChangeCallbacks.forEach(callback => callback(this.availableDevices));
      return this.availableDevices;
    } catch (error) {
      console.error('Error enumerating devices:', error);
      return [];
    }
  }

  getAvailableDevices(): MediaDevice[] {
    return this.availableDevices;
  }

  getVideoDevices(): MediaDevice[] {
    return this.availableDevices.filter(device => device.kind === 'videoinput');
  }

  getAudioDevices(): MediaDevice[] {
    return this.availableDevices.filter(device => device.kind === 'audioinput');
  }

  async switchCamera(deviceId: string): Promise<void> {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: this.currentAudioDeviceId ? { deviceId: { exact: this.currentAudioDeviceId } } : true
      });

      // Replace video track in all peer connections
      const videoTrack = newStream.getVideoTracks()[0];
      
      this.peers.forEach((peer) => {
        const sender = peer.getSenders().find(s => 
          s.track?.kind === 'video'
        );
        
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Stop old video tracks
      if (this.localStream) {
        this.localStream.getVideoTracks().forEach(track => track.stop());
        
        // Replace video track in local stream
        const audioTracks = this.localStream.getAudioTracks();
        this.localStream = new MediaStream([videoTrack, ...audioTracks]);
      } else {
        this.localStream = newStream;
      }

      this.currentVideoDeviceId = deviceId;
    } catch (error) {
      console.error('Error switching camera:', error);
      throw error;
    }
  }

  async switchMicrophone(deviceId: string): Promise<void> {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: this.currentVideoDeviceId ? { deviceId: { exact: this.currentVideoDeviceId } } : true,
        audio: { deviceId: { exact: deviceId } }
      });

      // Replace audio track in all peer connections
      const audioTrack = newStream.getAudioTracks()[0];
      
      this.peers.forEach((peer) => {
        const sender = peer.getSenders().find(s => 
          s.track?.kind === 'audio'
        );
        
        if (sender) {
          sender.replaceTrack(audioTrack);
        }
      });

      // Stop old audio tracks
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach(track => track.stop());
        
        // Replace audio track in local stream
        const videoTracks = this.localStream.getVideoTracks();
        this.localStream = new MediaStream([...videoTracks, audioTrack]);
      } else {
        this.localStream = newStream;
      }

      this.currentAudioDeviceId = deviceId;
    } catch (error) {
      console.error('Error switching microphone:', error);
      throw error;
    }
  }

  async getLocalStream(video = true, audio = true, videoDeviceId?: string, audioDeviceId?: string): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: video ? (videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true) : false,
        audio: audio ? (audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true) : false,
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoDeviceId) this.currentVideoDeviceId = videoDeviceId;
      if (audioDeviceId) this.currentAudioDeviceId = audioDeviceId;
      
      return this.localStream;
    } catch (error) {
      console.error('Error getting local stream:', error);
      throw error;
    }
  }

  createPeer(peerId: string, initiator: boolean, stream: MediaStream): SimplePeer.Instance {
    const peer = new SimplePeer({
      initiator,
      stream,
      trickle: true,
    });

    peer.on('signal', (signal) => {
      socketService.sendSignal(peerId, signal);
    });

    peer.on('stream', (remoteStream) => {
      this.onStreamCallbacks.forEach((callback) => 
        callback({ peerId, stream: remoteStream })
      );
    });

    peer.on('close', () => {
      this.handlePeerDisconnect(peerId);
    });

    peer.on('error', (err) => {
      console.error(`Peer error with ${peerId}:`, err);
      this.handlePeerDisconnect(peerId);
    });

    this.peers.set(peerId, peer);
    return peer;
  }

  async initiateCall(recipientId: string, ticketId: string): Promise<void> {
    if (!this.user) {
      throw new Error('User not initialized');
    }
    
    if (!this.localStream) {
      this.localStream = await this.getLocalStream();
    }
    
    socketService.initiateCall(recipientId, ticketId);
    this.createPeer(recipientId, true, this.localStream);
  }

  async acceptCall(callerId: string): Promise<void> {
    if (!this.localStream) {
      this.localStream = await this.getLocalStream();
    }
    
    this.createPeer(callerId, false, this.localStream);
  }

  async toggleVideo(enabled: boolean): Promise<void> {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  async toggleAudio(enabled: boolean): Promise<void> {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  async startScreenSharing(): Promise<MediaStream | null> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      
      // Replace video track in all peer connections
      if (this.screenStream && this.localStream) {
        const videoTrack = this.screenStream.getVideoTracks()[0];
        
        this.peers.forEach((peer) => {
          const sender = peer.getSenders().find(s => 
            s.track?.kind === 'video'
          );
          
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });
      }
      
      return this.screenStream;
    } catch (error) {
      console.error('Error starting screen sharing:', error);
      return null;
    }
  }

  async stopScreenSharing(): Promise<void> {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      
      // Restore camera video track
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        
        this.peers.forEach((peer) => {
          const sender = peer.getSenders().find(s => 
            s.track?.kind === 'video'
          );
          
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack);
          }
        });
      }
      
      this.screenStream = null;
    }
  }

  startRecording(): void {
    if (!this.localStream) return;

    try {
      this.recordedChunks = [];
      const options = { mimeType: 'video/webm; codecs=vp9' };
      this.mediaRecorder = new MediaRecorder(this.localStream, options);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }

  stopRecording(): Promise<Blob | null> {
    if (!this.mediaRecorder) return Promise.resolve(null);
    
    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: 'video/webm'
        });
        this.recordedChunks = [];
        resolve(blob);
      };
      
      this.mediaRecorder!.stop();
    });
  }

  endCall(): void {
    this.peers.forEach((peer) => {
      peer.destroy();
    });
    
    this.peers.clear();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    this.currentVideoDeviceId = null;
    this.currentAudioDeviceId = null;
  }

  private handlePeerDisconnect(peerId: string): void {
    this.peers.delete(peerId);
    this.onStreamRemoveCallbacks.forEach(callback => callback(peerId));
  }

  onStream(callback: (data: PeerStreamData) => void): () => void {
    this.onStreamCallbacks.push(callback);
    return () => {
      this.onStreamCallbacks = this.onStreamCallbacks.filter(cb => cb !== callback);
    };
  }

  onStreamRemove(callback: (peerId: string) => void): () => void {
    this.onStreamRemoveCallbacks.push(callback);
    return () => {
      this.onStreamRemoveCallbacks = this.onStreamRemoveCallbacks.filter(cb => cb !== callback);
    };
  }

  onDevicesChange(callback: (devices: MediaDevice[]) => void): () => void {
    this.onDevicesChangeCallbacks.push(callback);
    return () => {
      this.onDevicesChangeCallbacks = this.onDevicesChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  getCurrentVideoDeviceId(): string | null {
    return this.currentVideoDeviceId;
  }

  getCurrentAudioDeviceId(): string | null {
    return this.currentAudioDeviceId;
  }

  cleanup(): void {
    this.endCall();
    this.onStreamCallbacks = [];
    this.onStreamRemoveCallbacks = [];
    this.onDevicesChangeCallbacks = [];
  }
}

export const webRTCService = new WebRTCService();