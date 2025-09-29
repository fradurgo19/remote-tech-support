import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { socketService } from '../services/socket';
import { PeerStreamData, webRTCService } from '../services/webrtc';
import { useAuth } from './AuthContext';

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
  activeCameraStreams: Map<string, MediaStream>;
  activeCameraIds: string[];
  incomingCall: {
    isIncoming: boolean;
    caller: any;
    ticketId: string;
    callSessionId: string;
  } | null;
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
  addCamera: (deviceId: string) => Promise<MediaStream | null>;
  removeCamera: (deviceId: string) => Promise<void>;
  toggleCamera: (deviceId: string) => Promise<MediaStream | null>;
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
  const [activeCameraStreams, setActiveCameraStreams] = useState<
    Map<string, MediaStream>
  >(new Map());
  const [activeCameraIds, setActiveCameraIds] = useState<string[]>([]);
  const [incomingCall, setIncomingCall] = useState<{
    isIncoming: boolean;
    caller: any;
    ticketId: string;
    callSessionId: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      console.log('CallContext: Initializing with user:', user.id, user.name);
      webRTCService.initialize(user);

      const onStreamHandler = (data: PeerStreamData) => {
        console.log('Received remote stream from peer:', data.peerId);
        setRemoteStreams(prev => {
          const existingStreamIndex = prev.findIndex(
            p => p.peerId === data.peerId
          );
          if (existingStreamIndex >= 0) {
            const updated = [...prev];
            updated[existingStreamIndex] = data;
            return updated;
          } else {
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

      const unsubscribeStream = webRTCService.onStream(onStreamHandler);
      const unsubscribeRemove = webRTCService.onStreamRemove(
        onStreamRemoveHandler
      );
      const unsubscribeDevices = webRTCService.onDevicesChange(
        onDevicesChangeHandler
      );

      // Verificar conexión del socket
      console.log(
        'CallContext: Socket connected?',
        socketService.isConnected()
      );
      console.log(
        'CallContext: Socket available?',
        socketService.isServerAvailableStatus()
      );

      socketService.onCallRequest(async data => {
        console.log('CallContext: Llamada entrante recibida:', data);

        // Obtener información del llamador
        try {
          const response = await fetch(`/api/users/${data.from}`);
          const caller = await response.json();

          setIncomingCall({
            isIncoming: true,
            caller,
            ticketId: data.ticketId,
            callSessionId: data.callSessionId,
          });
        } catch (error) {
          console.error('Error obteniendo información del llamador:', error);
          // Usar información básica si falla la API
          setIncomingCall({
            isIncoming: true,
            caller: {
              id: data.from,
              name: 'Usuario',
              email: 'usuario@ejemplo.com',
            },
            ticketId: data.ticketId,
            callSessionId: data.callSessionId,
          });
        }
      });

      return () => {
        unsubscribeStream();
        unsubscribeRemove();
        unsubscribeDevices();
        webRTCService.cleanup();
      };
    }
  }, [user]);

  const initiateCall = async (recipientId: string, ticketId: string) => {
    setError(null);
    setIsLoading(true);

    try {
      console.log(
        'CallContext: Iniciating call to:',
        recipientId,
        'ticket:',
        ticketId
      );
      console.log(
        'CallContext: Socket connected before call?',
        socketService.isConnected()
      );

      // Get local stream first
      const stream = await webRTCService.getLocalStream(true, true);
      console.log('CallContext: Local stream obtained:', {
        id: stream.id,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
      });

      setLocalStream(stream);
      setVideoEnabled(true);
      setAudioEnabled(true);

      // Then initiate the call
      await webRTCService.initiateCall(recipientId, ticketId);
      setIsInCall(true);

      console.log('CallContext: Call initiated successfully');
    } catch (err) {
      console.error('CallContext: Error initiating call:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptCall = async (callerId: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const stream = await webRTCService.getLocalStream(true, true);
      setLocalStream(stream);
      setVideoEnabled(true);
      setAudioEnabled(true);

      await webRTCService.acceptCall(callerId);
      setIsInCall(true);
    } catch (err) {
      console.error('Error accepting call:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptIncomingCall = async () => {
    if (!incomingCall) return;

    setError(null);
    setIsLoading(true);

    try {
      // Notificar al servidor que aceptamos la llamada
      socketService.getSocket()?.emit('call-accept', {
        callSessionId: incomingCall.callSessionId,
      });

      // Aceptar la llamada WebRTC
      await acceptCall(incomingCall.caller.id);

      // Limpiar la llamada entrante
      setIncomingCall(null);
    } catch (err) {
      console.error('Error accepting incoming call:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const declineIncomingCall = () => {
    if (!incomingCall) return;

    try {
      // Notificar al servidor que rechazamos la llamada
      socketService.getSocket()?.emit('call-decline', {
        callSessionId: incomingCall.callSessionId,
      });

      // Limpiar la llamada entrante
      setIncomingCall(null);
    } catch (err) {
      console.error('Error declining incoming call:', err);
    }
  };

  const toggleVideo = async () => {
    try {
      const newVideoState = !videoEnabled;
      await webRTCService.toggleVideo(newVideoState);
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
      await webRTCService.toggleAudio(newAudioState);
      setAudioEnabled(newAudioState);
      console.log('Audio toggled to:', newAudioState);
    } catch (err) {
      console.error('Error toggling audio:', err);
      setError((err as Error).message);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await webRTCService.stopScreenSharing();
      } else {
        const screenStream = await webRTCService.startScreenSharing();
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
        const recordingBlob = await webRTCService.stopRecording();
        if (recordingBlob) {
          console.log(
            'Grabación detenida, tamaño del blob:',
            recordingBlob.size
          );
        }
      } else {
        webRTCService.startRecording();
      }
      setIsRecording(!isRecording);
    } catch (err) {
      console.error('Error toggling recording:', err);
      setError((err as Error).message);
    }
  };

  const switchCamera = async (deviceId: string) => {
    try {
      await webRTCService.switchCamera(deviceId);
    } catch (err) {
      console.error('Error switching camera:', err);
      setError((err as Error).message);
    }
  };

  const switchMicrophone = async (deviceId: string) => {
    try {
      await webRTCService.switchMicrophone(deviceId);
    } catch (err) {
      console.error('Error switching microphone:', err);
      setError((err as Error).message);
    }
  };

  const addCamera = async (deviceId: string): Promise<MediaStream | null> => {
    try {
      const stream = await webRTCService.addCamera(deviceId);
      if (stream) {
        setActiveCameraStreams(webRTCService.getActiveCameraStreams());
        setActiveCameraIds(webRTCService.getActiveCameraIds());
      }
      return stream;
    } catch (err) {
      console.error('Error adding camera:', err);
      setError((err as Error).message);
      return null;
    }
  };

  const removeCamera = async (deviceId: string): Promise<void> => {
    try {
      await webRTCService.removeCamera(deviceId);
      setActiveCameraStreams(webRTCService.getActiveCameraStreams());
      setActiveCameraIds(webRTCService.getActiveCameraIds());
    } catch (err) {
      console.error('Error removing camera:', err);
      setError((err as Error).message);
    }
  };

  const toggleCamera = async (
    deviceId: string
  ): Promise<MediaStream | null> => {
    try {
      const stream = await webRTCService.toggleCamera(deviceId);
      setActiveCameraStreams(webRTCService.getActiveCameraStreams());
      setActiveCameraIds(webRTCService.getActiveCameraIds());
      return stream;
    } catch (err) {
      console.error('Error toggling camera:', err);
      setError((err as Error).message);
      return null;
    }
  };

  const endCall = useCallback(() => {
    console.log('Ending call');
    webRTCService.endCall();
    setIsInCall(false);
    setLocalStream(null);
    setRemoteStreams([]);
    setIsScreenSharing(false);
    setVideoEnabled(true);
    setAudioEnabled(true);
    setActiveCameraStreams(new Map());
    setActiveCameraIds([]);
    setIncomingCall(null);

    if (isRecording) {
      webRTCService.stopRecording();
      setIsRecording(false);
    }
  }, [isRecording]);

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
        activeCameraStreams,
        activeCameraIds,
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
        addCamera,
        removeCamera,
        toggleCamera,
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
