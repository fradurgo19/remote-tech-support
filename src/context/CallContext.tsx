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
  availableDevices: MediaDeviceInfo[];
  activeCameraStreams: Map<string, MediaStream>;
  activeCameraIds: string[];
  incomingCall: {
    isIncoming: boolean;
    caller: { id: string; name: string; email: string; avatar?: string };
    ticketId: string;
    callSessionId: string;
  } | null;
  peerConnection: RTCPeerConnection | null;
  callStartTime: number | null;
  isPictureInPicture: boolean;
  setIsPictureInPicture: (value: boolean) => void;
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
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeCameraStreams, setActiveCameraStreams] = useState<
    Map<string, MediaStream>
  >(new Map());
  const [activeCameraIds, setActiveCameraIds] = useState<string[]>([]);
  const [incomingCall, setIncomingCall] = useState<{
    isIncoming: boolean;
    caller: { id: string; name: string; email: string; avatar?: string };
    ticketId: string;
    callSessionId: string;
  } | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('CallContext: Initializing with user:', user.id, user.name);
      webRTCNativeService.initialize(user);

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

      // Stream removal is handled automatically by WebRTC native

      const onDevicesChangeHandler = (devices: any[]) => {
        setAvailableDevices(devices);
      };

      const unsubscribeStream = webRTCNativeService.onStream(onStreamHandler);
      const unsubscribeDevices = webRTCNativeService.onDevices(
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

        // Usar información del llamador que viene del servidor
        setIncomingCall({
          isIncoming: true,
          caller: {
            id: data.from,
            name: data.fromName || 'Usuario',
            email: data.fromEmail || 'usuario@ejemplo.com',
            avatar: data.fromAvatar,
          },
          ticketId: data.ticketId,
          callSessionId: data.callSessionId,
        });

        console.log('CallContext: Información del llamador:', {
          id: data.from,
          name: data.fromName,
          email: data.fromEmail,
        });
      });

      return () => {
        unsubscribeStream();
        unsubscribeRemove();
        unsubscribeDevices();
        webRTCNativeService.cleanup();
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
      const stream = await webRTCNativeService.getLocalStream(true, true);
      console.log('CallContext: Local stream obtained:', {
        id: stream.id,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
      });

      setLocalStream(stream);
      setVideoEnabled(true);
      setAudioEnabled(true);

      // Then initiate the call
      await webRTCNativeService.initiateCall(recipientId, ticketId);
      setIsInCall(true);
      setCallStartTime(Date.now());
      
      // Get peer connection for stats
      const pc = webRTCNativeService.getPeerConnection(recipientId);
      setPeerConnection(pc);

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
      // Intentar obtener stream con cámara y audio
      let stream: MediaStream | null = null;
      let videoEnabled = true;
      let audioEnabled = true;

      try {
        stream = await webRTCNativeService.getLocalStream(true, true);
        console.log('CallContext: Stream obtenido con cámara y audio');
      } catch (cameraError) {
        console.warn(
          'CallContext: Cámara no disponible, intentando solo audio:',
          cameraError
        );

        try {
          // Intentar solo audio
          stream = await webRTCNativeService.getLocalStream(false, true);
          videoEnabled = false;
          audioEnabled = true;
          console.log('CallContext: Stream obtenido solo con audio');
        } catch (audioError) {
          console.warn(
            'CallContext: Audio no disponible, creando stream vacío:',
            audioError
          );

          // Crear stream vacío (solo para la conexión WebRTC)
          stream = new MediaStream();
          videoEnabled = false;
          audioEnabled = false;
          console.log('CallContext: Stream vacío creado');
        }
      }

      if (stream) {
        setLocalStream(stream);
        setVideoEnabled(videoEnabled);
        setAudioEnabled(audioEnabled);

        await webRTCNativeService.acceptCall(callerId);
        setIsInCall(true);
        setCallStartTime(Date.now());
        
        // Get peer connection for stats
        const pc = webRTCNativeService.getPeerConnection(callerId);
        setPeerConnection(pc);

        console.log('CallContext: Llamada aceptada exitosamente');
        console.log(
          'CallContext: Video:',
          videoEnabled,
          'Audio:',
          audioEnabled
        );
      } else {
        throw new Error('No se pudo crear ningún stream de media');
      }
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
      await webRTCNativeService.toggleAudio(newAudioState);
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

  const addCamera = async (deviceId: string): Promise<MediaStream | null> => {
    try {
      const stream = await webRTCNativeService.addCamera(deviceId);
      if (stream) {
        setActiveCameraStreams(webRTCNativeService.getActiveCameraStreams());
        setActiveCameraIds(webRTCNativeService.getActiveCameraIds());
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
      await webRTCNativeService.removeCamera(deviceId);
      setActiveCameraStreams(webRTCNativeService.getActiveCameraStreams());
      setActiveCameraIds(webRTCNativeService.getActiveCameraIds());
    } catch (err) {
      console.error('Error removing camera:', err);
      setError((err as Error).message);
    }
  };

  const toggleCamera = async (
    deviceId: string
  ): Promise<MediaStream | null> => {
    try {
      const stream = await webRTCNativeService.toggleCamera(deviceId);
      setActiveCameraStreams(webRTCNativeService.getActiveCameraStreams());
      setActiveCameraIds(webRTCNativeService.getActiveCameraIds());
      return stream;
    } catch (err) {
      console.error('Error toggling camera:', err);
      setError((err as Error).message);
      return null;
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
    setActiveCameraStreams(new Map());
    setActiveCameraIds([]);
    setIncomingCall(null);
    setPeerConnection(null);
    setCallStartTime(null);
    setIsPictureInPicture(false);

    if (isRecording) {
      webRTCNativeService.stopRecording();
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
        peerConnection,
        callStartTime,
        isPictureInPicture,
        setIsPictureInPicture,
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
