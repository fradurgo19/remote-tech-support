import { PhoneCall } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '../atoms/Button';
import { useCall } from '../context/CallContext';
import { CallControls } from '../molecules/CallControls';
import { DeviceSelector } from '../molecules/DeviceSelector';
import { VideoGrid } from '../molecules/VideoGrid';
import { User } from '../types';

interface VideoCallPanelProps {
  recipientId?: string;
  ticketId?: string;
  localUser?: User;
  remoteUsers?: Record<string, User>;
}

export const VideoCallPanel: React.FC<VideoCallPanelProps> = ({
  recipientId,
  ticketId,
  localUser,
  remoteUsers = {},
}) => {
  const {
    localStream,
    remoteStreams,
    isInCall,
    isLoading,
    videoEnabled,
    audioEnabled,
    isScreenSharing,
    isRecording,
    activeCameraStreams,
    activeCameraIds,
    initiateCall,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    toggleRecording,
    toggleCamera,
    endCall,
  } = useCall();

  const [callError, setCallError] = useState<string | null>(null);
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);
  const [isInitializingCall, setIsInitializingCall] = useState(false);

  const handleInitiateCall = async () => {
    if (!recipientId || !ticketId) {
      setCallError('Falta información del destinatario o ticket');
      return;
    }

    // Verificar que no se esté llamando a sí mismo
    if (localUser && recipientId === localUser.id) {
      setCallError('No puedes llamarte a ti mismo');
      return;
    }

    setCallError(null);
    setIsInitializingCall(true);

    try {
      await initiateCall(recipientId, ticketId);
    } catch (error) {
      setCallError((error as Error).message);
    } finally {
      setIsInitializingCall(false);
    }
  };

  const handleDeviceChange = (deviceId: string, type: 'video' | 'audio') => {
    console.log(`Dispositivo ${type} cambiado a:`, deviceId);
  };

  // Debug: Log stream status
  useEffect(() => {
    console.log('VideoCallPanel - Stream status:', {
      localStream: !!localStream,
      localStreamTracks: localStream?.getTracks().length || 0,
      videoTracks: localStream?.getVideoTracks().length || 0,
      audioTracks: localStream?.getAudioTracks().length || 0,
      isInCall,
      videoEnabled,
      audioEnabled,
    });
  }, [localStream, isInCall, videoEnabled, audioEnabled]);

  return (
    <div className='flex flex-col h-full bg-gray-950 rounded-lg overflow-hidden'>
      <div className='flex-1 relative'>
        {isInCall || localStream || activeCameraStreams.size > 0 ? (
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            localUser={localUser}
            remoteUsers={remoteUsers}
            isScreenSharing={isScreenSharing}
            activeCameraStreams={activeCameraStreams}
            activeCameraIds={activeCameraIds}
          />
        ) : (
          <div className='flex flex-col items-center justify-center h-full text-white p-6'>
            <div className='bg-gray-800/60 p-8 rounded-xl flex flex-col items-center max-w-md'>
              <div className='bg-primary/20 p-4 rounded-full mb-4'>
                <PhoneCall size={40} className='text-primary' />
              </div>
              <h2 className='text-2xl font-semibold mb-2'>
                Iniciar Llamada de Soporte
              </h2>
              <p className='text-gray-400 text-center mb-4'>
                Conéctate con video y audio para brindar asistencia técnica en
                tiempo real
              </p>

              {recipientId && remoteUsers[recipientId] && (
                <div className='bg-gray-700/50 p-4 rounded-lg mb-4'>
                  <p className='text-sm text-gray-300 mb-1'>Llamando a:</p>
                  <p className='text-lg font-medium text-white'>
                    {remoteUsers[recipientId].name}
                  </p>
                  <p className='text-sm text-gray-400'>
                    {remoteUsers[recipientId].email}
                  </p>
                </div>
              )}

              {!recipientId && (
                <div className='bg-yellow-500/20 border border-yellow-500/30 p-4 rounded-lg mb-4'>
                  <p className='text-yellow-200 text-sm'>
                    ⚠️ No hay destinatario disponible para la llamada
                  </p>
                </div>
              )}

              <div className='space-y-3 w-full'>
                <Button
                  onClick={handleInitiateCall}
                  disabled={
                    isLoading ||
                    isInitializingCall ||
                    !recipientId ||
                    !ticketId ||
                    (localUser && recipientId === localUser.id)
                  }
                  isLoading={isLoading || isInitializingCall}
                  size='lg'
                  className='w-full'
                  leftIcon={<PhoneCall size={18} />}
                >
                  {isInitializingCall ? 'Iniciando...' : 'Iniciar Llamada'}
                </Button>

                <Button
                  variant='outline'
                  onClick={() => setShowDeviceSelector(true)}
                  className='w-full'
                >
                  Configurar Dispositivos
                </Button>
              </div>

              {callError && (
                <p className='text-destructive mt-2 text-sm'>{callError}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {(isInCall || localStream) && (
        <div className='p-4 flex justify-center'>
          <CallControls
            videoEnabled={videoEnabled}
            audioEnabled={audioEnabled}
            isScreenSharing={isScreenSharing}
            isRecording={isRecording}
            onToggleVideo={toggleVideo}
            onToggleAudio={toggleAudio}
            onToggleScreenShare={toggleScreenShare}
            onToggleRecording={toggleRecording}
            onEndCall={endCall}
            onOpenDeviceSettings={() => setShowDeviceSelector(true)}
          />
        </div>
      )}

      <DeviceSelector
        isOpen={showDeviceSelector}
        onClose={() => setShowDeviceSelector(false)}
        onDeviceChange={handleDeviceChange}
        onToggleCamera={toggleCamera}
        activeCameraIds={activeCameraIds}
      />
    </div>
  );
};
