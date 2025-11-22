import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { socketService } from '../services/socket';
import { PeerStreamData, webRTCNativeService } from '../services/webrtc-native';
import { useAuth } from './AuthContext';

interface IncomingCall {
  isIncoming: boolean;
  caller: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    avatar?: string;
  };
  ticketId: string;
  callSessionId: string;
}

interface CallContextType {
  localStream: MediaStream | null;
  remoteStreams: PeerStreamData[];
  isInCall: boolean;
  isLoading: boolean;
  error: string | null;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  availableDevices: any[];
  incomingCall: IncomingCall | null;
  initiateCall: (recipientId: string, ticketId: string) => Promise<void>;
  acceptCall: (callerId: string) => Promise<void>;
  acceptIncomingCall: () => Promise<void>;
  declineIncomingCall: () => void;
  toggleVideo: () => Promise<void>;
  toggleAudio: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  toggleRecording: () => Promise<void>;
  switchCamera: (deviceId: string) => Promise<void>;
  switchMicrophone: (deviceId: string) => Promise<void>;
  switchToFrontCamera: () => Promise<void>;
  switchToBackCamera: () => Promise<void>;
  endCall: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<PeerStreamData[]>([]);
  const [isInCall, setIsInCall] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<any[]>([]);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

  useEffect(() => {
    if (user) {
      webRTCNativeService.initialize(user);

      const onStreamHandler = (data: PeerStreamData) => {
        console.log(
          '🎥 CallContext: Received remote stream from peer:',
          data.peerId,
          {
            streamId: data.stream.id,
            videoTracks: data.stream.getVideoTracks().length,
            audioTracks: data.stream.getAudioTracks().length,
          }
        );
        setRemoteStreams(prev => {
          const existingStreamIndex = prev.findIndex(
            p => p.peerId === data.peerId
          );
          if (existingStreamIndex >= 0) {
            console.log('🔄 Updating existing remote stream for:', data.peerId);
            const updated = [...prev];
            updated[existingStreamIndex] = data;
            return updated;
          } else {
            console.log('➕ Adding new remote stream for:', data.peerId);
            return [...prev, data];
          }
        });
      };

      const onStreamRemoveHandler = (peerId: string) => {
        console.log('Remote stream removed from peer:', peerId);
        setRemoteStreams(prev => prev.filter(p => p.peerId !== peerId));
      };

      const onDevicesChangeHandler = (devices: any[]) => {
        setAvailableDevices(devices);
      };

      const unsubscribeStream = webRTCNativeService.onStream(onStreamHandler);
      const unsubscribeDevices = webRTCNativeService.onDevices(
        onDevicesChangeHandler
      );

      const unsubscribeCallRequest = socketService.onCallRequest(async data => {
        console.log('📞 CallContext: Llamada entrante de:', data);
        console.log('📞 CallContext: Socket status:', {
          socket: !!socketService.getSocket(),
          connected: socketService.getSocket()?.connected,
        });

        // Crear objeto de llamada entrante con toda la información del usuario
        const incomingCallData = {
          isIncoming: true,
          caller: {
            id: data.from,
            name: data.fromName || 'Usuario Desconocido',
            email: data.fromEmail || '',
            role: 'technician' as const,
            status: 'online' as const,
            avatar: data.fromAvatar,
          },
          ticketId: data.ticketId,
          callSessionId: data.callSessionId || data.from + '-' + Date.now(),
        };

        setIncomingCall(incomingCallData);
        console.log(
          '✅ CallContext: Notificación de llamada entrante establecida:',
          incomingCallData
        );
      });

      console.log('📞 CallContext: Call request listener registered');

      return () => {
        unsubscribeStream();
        unsubscribeDevices();
        unsubscribeCallRequest();
        webRTCNativeService.cleanup();
      };
    }
  }, [user]);

  const initiateCall = async (recipientId: string, ticketId: string) => {
    setError(null);
    setIsLoading(true);

    try {
      console.log('📞 Initiating call to:', recipientId);

      // Verificar que el socket esté conectado antes de continuar
      const socket = socketService.getSocket();
      if (!socket || !socket.connected) {
        console.log('⏳ Socket not connected, waiting for connection...');
        // Esperar hasta 5 segundos por la conexión
        let attempts = 0;
        while (attempts < 10 && (!socket || !socket.connected)) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
        
        if (!socket || !socket.connected) {
          throw new Error('No se pudo conectar al servidor. Por favor, recarga la página e intenta nuevamente.');
        }
      }
      console.log('✅ Socket connected, proceeding with call');

      // Get local stream first
      console.log('📹 Requesting camera and microphone permissions...');
      const stream = await webRTCNativeService.getLocalStream(true, true);
      console.log('✅ Local stream obtained:', {
        id: stream.id,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
        videoEnabled: stream.getVideoTracks()[0]?.enabled,
        audioEnabled: stream.getAudioTracks()[0]?.enabled,
      });

      setLocalStream(stream);
      setVideoEnabled(true);
      setAudioEnabled(true);

      // Delay importante: Esperar a que los permisos se procesen completamente
      console.log('⏳ Waiting for permissions to settle...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Then initiate the call
      console.log('🚀 Creating peer connection as initiator...');
      await webRTCNativeService.initiateCall(recipientId, ticketId);
      setIsInCall(true);

      console.log('✅ Call initiated and signal sent successfully');
    } catch (err) {
      console.error('❌ Error initiating call:', err);
      setError((err as Error).message);

      // Limpiar stream si falla
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const acceptCall = async (callerId: string) => {
    setError(null);
    setIsLoading(true);

    try {
      console.log('🎯 Accepting call from:', callerId);

      const stream = await webRTCNativeService.getLocalStream(true, true);
      console.log('📹 Local stream obtained for accepting call:', {
        id: stream.id,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
      });

      setLocalStream(stream);
      setVideoEnabled(true);
      setAudioEnabled(true);

      console.log('🔗 Creating peer connection as receiver...');
      await webRTCNativeService.acceptCall(callerId);
      setIsInCall(true);
      console.log('✅ Call accepted successfully');
    } catch (err) {
      console.error('❌ Error accepting call:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVideo = async () => {
    try {
      const newVideoState = !videoEnabled;
      await webRTCNativeService.toggleVideo(newVideoState);
      setVideoEnabled(newVideoState);
      console.log('Video toggled to:', newVideoState);
    } catch (err) {
      console.error('Error toggling video:', err);
      setError((err as Error).message);
    }
  };

  const toggleAudio = async () => {
    try {
      const newAudioState = !audioEnabled;
      if (localStream) {
        localStream.getAudioTracks().forEach(track => {
          track.enabled = newAudioState;
        });
        setAudioEnabled(newAudioState);
        console.log('Audio toggled to:', newAudioState);
      }
    } catch (err) {
      console.error('Error toggling audio:', err);
      setError((err as Error).message);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await webRTCNativeService.stopScreenSharing();
      } else {
        const screenStream = await webRTCNativeService.startScreenSharing();
        if (!screenStream) {
          throw new Error(
            'No se pudo obtener el stream de pantalla compartida'
          );
        }
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (err) {
      console.error('Error toggling screen share:', err);
      setError((err as Error).message);
    }
  };

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        const recordingBlob = await webRTCNativeService.stopRecording();
        if (recordingBlob) {
          console.log(
            'Grabación detenida, tamaño del blob:',
            recordingBlob.size
          );
        }
      } else {
        webRTCNativeService.startRecording();
      }
      setIsRecording(!isRecording);
    } catch (err) {
      console.error('Error toggling recording:', err);
      setError((err as Error).message);
    }
  };

  const switchCamera = async (deviceId: string) => {
    try {
      await webRTCNativeService.switchCamera(deviceId);
    } catch (err) {
      console.error('Error switching camera:', err);
      setError((err as Error).message);
    }
  };

  const switchMicrophone = async (deviceId: string) => {
    try {
      await webRTCNativeService.switchMicrophone(deviceId);
    } catch (err) {
      console.error('Error switching microphone:', err);
      setError((err as Error).message);
    }
  };

  const switchToFrontCamera = async () => {
    try {
      console.log('🔄 Cambiando a cámara frontal...');
      await webRTCNativeService.switchToFrontCamera();

      // Actualizar el localStream en el contexto
      const newStream = webRTCNativeService.getLocalStreamInstance();
      if (newStream) {
        setLocalStream(newStream);
      }

      console.log('✅ Cambiado a cámara frontal');
    } catch (err) {
      console.error('❌ Error al cambiar a cámara frontal:', err);
      setError((err as Error).message);
    }
  };

  const switchToBackCamera = async () => {
    try {
      console.log('🔄 Cambiando a cámara trasera...');
      await webRTCNativeService.switchToBackCamera();

      // Actualizar el localStream en el contexto
      const newStream = webRTCNativeService.getLocalStreamInstance();
      if (newStream) {
        setLocalStream(newStream);
      }

      console.log('✅ Cambiado a cámara trasera');
    } catch (err) {
      console.error('❌ Error al cambiar a cámara trasera:', err);
      setError((err as Error).message);
    }
  };

  const endCall = useCallback(() => {
    console.log('Ending call');
    webRTCNativeService.endCall();
    setIsInCall(false);
    setLocalStream(null);
    setRemoteStreams([]);
    setIsScreenSharing(false);
    setVideoEnabled(true);
    setAudioEnabled(true);
    setIncomingCall(null);

    if (isRecording) {
      webRTCNativeService.stopRecording();
      setIsRecording(false);
    }
  }, [isRecording]);

  const acceptIncomingCall = useCallback(async () => {
    if (!incomingCall) return;

    setError(null);
    setIsLoading(true);

    try {
      await acceptCall(incomingCall.caller.id);
      setIncomingCall(null);
    } catch (err) {
      console.error('Error accepting call:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [incomingCall]);

  const declineIncomingCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  return (
    <CallContext.Provider
      value={{
        localStream,
        remoteStreams,
        isInCall,
        isLoading,
        error,
        videoEnabled,
        audioEnabled,
        isScreenSharing,
        isRecording,
        availableDevices,
        incomingCall,
        initiateCall,
        acceptCall,
        acceptIncomingCall,
        declineIncomingCall,
        toggleVideo,
        toggleAudio,
        toggleScreenShare,
        toggleRecording,
        switchCamera,
        switchMicrophone,
        switchToFrontCamera,
        switchToBackCamera,
        endCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = (): CallContextType => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
