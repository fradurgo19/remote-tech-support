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
      webRTCService.initialize(user);

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

      const unsubscribeStream = webRTCService.onStream(onStreamHandler);
      const unsubscribeRemove = webRTCService.onStreamRemove(
        onStreamRemoveHandler
      );
      const unsubscribeDevices = webRTCService.onDevicesChange(
        onDevicesChangeHandler
      );

      socketService.onCallRequest(async data => {
        console.log('Llamada entrante de:', data);

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
          'Notificación de llamada entrante establecida:',
          incomingCallData
        );
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
      console.log('Iniciating call to:', recipientId);

      // Get local stream first
      const stream = await webRTCService.getLocalStream(true, true);
      console.log('Local stream obtained:', {
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

      console.log('Call initiated successfully');
    } catch (err) {
      console.error('Error initiating call:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptCall = async (callerId: string) => {
    setError(null);
    setIsLoading(true);

    try {
      console.log('🎯 Accepting call from:', callerId);

      const stream = await webRTCService.getLocalStream(true, true);
      console.log('📹 Local stream obtained for accepting call:', {
        id: stream.id,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
      });

      setLocalStream(stream);
      setVideoEnabled(true);
      setAudioEnabled(true);

      console.log('🔗 Creating peer connection as receiver...');
      await webRTCService.acceptCall(callerId);
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

  const endCall = useCallback(() => {
    console.log('Ending call');
    webRTCService.endCall();
    setIsInCall(false);
    setLocalStream(null);
    setRemoteStreams([]);
    setIsScreenSharing(false);
    setVideoEnabled(true);
    setAudioEnabled(true);
    setIncomingCall(null);

    if (isRecording) {
      webRTCService.stopRecording();
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
