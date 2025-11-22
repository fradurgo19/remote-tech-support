import React, { useEffect, useRef } from 'react';
import { Avatar } from '../atoms/Avatar';
import { PeerStreamData } from '../services/webrtc';
import { User } from '../types';

interface VideoContainerProps {
  stream: MediaStream;
  isMuted?: boolean;
  user?: User;
  isScreenShare?: boolean;
  isLocal?: boolean;
}

const VideoContainer: React.FC<VideoContainerProps> = ({
  stream,
  isMuted = false,
  user,
  isScreenShare = false,
  isLocal = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;

      // Asegurar que los tracks de audio estén habilitados para streams remotos
      if (!isLocal) {
        const audioTracks = stream.getAudioTracks();
        audioTracks.forEach(track => {
          track.enabled = true;
          console.log(
            `🔊 Remoto: Audio track enabled=${track.enabled}, muted=${track.muted}`
          );
        });

        // Asegurar que los tracks de video estén habilitados para streams remotos
        const videoTracks = stream.getVideoTracks();
        videoTracks.forEach(track => {
          if (!track.enabled) {
            console.log(
              '📹 Forcing video track to be enabled in VideoContainer'
            );
            track.enabled = true;
          }
          console.log(
            `🎥 Remoto: Video track enabled=${track.enabled}, readyState=${track.readyState}, muted=${track.muted}`
          );
        });
      }

      // Force play for local streams
      if (isLocal) {
        videoRef.current.play().catch(console.error);
      } else {
        // Para streams remotos, asegurar que el video no esté muteado
        videoRef.current.muted = isMuted;
        videoRef.current.play().catch(console.error);
      }
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream, isLocal, isMuted]);

  // Handle track state changes
  useEffect(() => {
    if (!stream || !videoRef.current) return;

    const handleTrackEnded = () => {
      console.log('Track ended, attempting to refresh video');
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error);
      }
    };

    const updateVideoTracks = () => {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.addEventListener('ended', handleTrackEnded);
        // Force play if track becomes enabled
        if (track.enabled && videoRef.current) {
          videoRef.current.play().catch(console.error);
        }
      });

      return () => {
        videoTracks.forEach(track => {
          track.removeEventListener('ended', handleTrackEnded);
        });
      };
    };

    const cleanup = updateVideoTracks();
    return cleanup;
  }, [stream]);

  // Force video element update when stream tracks change
  useEffect(() => {
    if (videoRef.current && stream) {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        // Force a small delay to ensure track is ready
        const timer = setTimeout(() => {
          if (videoRef.current && videoRef.current.srcObject !== stream) {
            videoRef.current.srcObject = stream;
            if (isLocal) {
              videoRef.current.play().catch(console.error);
            }
          }
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [stream?.getVideoTracks(), isLocal]);

  // Check if video track is active
  const hasActiveVideo = stream
    ?.getVideoTracks()
    .some(
      track =>
        track.enabled &&
        (track.readyState === 'live' || track.readyState === 'starting')
    );

  // Debug logging for video track status
  useEffect(() => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach((track, index) => {
        console.log(`🎥 VideoContainer - Track ${index}:`, {
          enabled: track.enabled,
          readyState: track.readyState,
          muted: track.muted,
          label: track.label,
          isLocal,
        });
      });
      console.log(`🎥 VideoContainer - hasActiveVideo: ${hasActiveVideo}`);
    }
  }, [stream, hasActiveVideo, isLocal]);

  // Detectar si es PC para aplicar mejoras de renderizado (opción 2 y 6)
  const isPC = typeof window !== 'undefined' && 
    !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  return (
    <div className='relative overflow-hidden rounded-lg bg-gray-900 w-full h-full'>
      {hasActiveVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className={`w-full h-full ${
            isScreenShare ? 'object-contain bg-black' : 'object-cover'
          } ${
            // Opción 2 y 6: Mejora de renderizado para video remoto en PC
            !isLocal && isPC 
              ? 'video-enhancement video-remote-brightness-fix' 
              : ''
          }`}
          style={
            // Opción 6: Upscaling inteligente con filtros CSS + Reducción de brillo para remotos
            !isLocal && isPC
              ? {
                  imageRendering: 'crisp-edges' as const,
                  // Reducir brillo significativamente para pantallas brillantes (0.65 = 35% menos brillo)
                  // Aumentar contraste para compensar y mejorar definición
                  filter: 'brightness(0.65) contrast(1.3) saturate(1.1)',
                  transform: 'scale(1)',
                  willChange: 'filter',
                }
              : undefined
          }
        />
      ) : (
        <div className='w-full h-full flex items-center justify-center bg-gray-800'>
          <div className='text-center'>
            <div className='mb-4'>
              <Avatar src={user?.avatar} size='xl' status={user?.status} />
            </div>
            <p className='text-white text-sm'>
              {isLocal
                ? 'Cámara desactivada'
                : `${user?.name || 'Usuario'} - Cámara desactivada`}
            </p>
          </div>
        </div>
      )}

      {user && (
        <div className='absolute bottom-2 left-2 flex items-center gap-2 bg-gray-900/70 px-2 py-1 rounded-lg backdrop-blur-sm'>
          <Avatar src={user.avatar} size='sm' status={user.status} />
          <span className='text-white text-sm font-medium'>
            {isLocal ? `${user.name} (Tú)` : user.name}
          </span>
        </div>
      )}
    </div>
  );
};

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: PeerStreamData[];
  localUser?: User;
  remoteUsers?: Record<string, User>;
  isScreenSharing?: boolean;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  remoteStreams,
  localUser,
  remoteUsers = {},
  isScreenSharing,
}) => {
  const getGridClassName = () => {
    const totalStreams = (localStream ? 1 : 0) + remoteStreams.length;

    if (totalStreams === 1) {
      return 'grid-cols-1 grid-rows-1';
    } else if (totalStreams === 2) {
      return 'grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1';
    } else if (totalStreams <= 4) {
      return 'grid-cols-2 grid-rows-2';
    } else {
      return 'grid-cols-2 md:grid-cols-3 grid-rows-2 md:grid-rows-2';
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('VideoGrid render:', {
      hasLocalStream: !!localStream,
      localStreamTracks: localStream?.getTracks().length || 0,
      remoteStreamsCount: remoteStreams.length,
      localUser: localUser?.name,
      isScreenSharing,
    });
  }, [localStream, remoteStreams, localUser, isScreenSharing]);

  if (!localStream && remoteStreams.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-full bg-gray-900 rounded-lg'>
        <div className='text-white text-xl mb-4'>No hay video activo</div>
        <p className='text-gray-400 text-sm text-center'>
          La cámara está desactivada o la llamada aún no ha comenzado
        </p>
      </div>
    );
  }

  // Si hay streams remotos, usar layout Picture-in-Picture
  const hasSomeone = remoteStreams.length > 0;

  return (
    <div className='relative h-full w-full overflow-hidden'>
      {hasSomeone ? (
        // Layout adaptativo según cantidad de cámaras
        remoteStreams.length === 1 ? (
          // 1 cámara remota: layout principal grande y cuadrado + local pequeño
          <div className='relative h-full w-full'>
            {/* Video remoto - Ocupa desde izquierda hasta donde empieza el local (240px desde la derecha) */}
            {remoteStreams.map(peerStream => (
              <div
                key={peerStream.peerId}
                className={`absolute inset-0 flex items-center justify-center md:justify-start p-0 ${
                  localStream ? 'md:right-[240px]' : ''
                }`}
              >
                {/* En móvil: cuadrado centrado, en PC: ocupa todo el ancho disponible */}
                <div className='w-full h-full aspect-square md:aspect-auto md:h-full'>
                  <VideoContainer
                    stream={peerStream.stream}
                    user={remoteUsers[peerStream.peerId]}
                    isMuted={false}
                    isLocal={false}
                  />
                </div>
              </div>
            ))}

            {/* Video local - Abajo en móvil, esquina en PC */}
            {localStream && (
              <>
                {/* Móvil: Abajo, ocupa todo el ancho */}
                <div className='md:hidden absolute bottom-0 left-0 right-0 w-full h-32 border-t-2 border-white/20 z-10'>
                  <VideoContainer
                    stream={localStream}
                    isMuted={true}
                    user={localUser}
                    isScreenShare={isScreenSharing}
                    isLocal={true}
                  />
                </div>
                {/* Desktop: Esquina inferior derecha - w-56 (224px) + right-4 (16px) = 240px */}
                <div className='hidden md:block absolute bottom-4 right-4 w-56 h-42 z-10 shadow-2xl border-2 border-white/30 rounded-lg overflow-hidden bg-gray-900'>
                  <VideoContainer
                    stream={localStream}
                    isMuted={true}
                    user={localUser}
                    isScreenShare={isScreenSharing}
                    isLocal={true}
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          // 2+ cámaras remotas: Grid layout
          <div className='grid grid-cols-2 h-full w-full gap-2 p-2'>
            {remoteStreams.map(peerStream => (
              <div key={peerStream.peerId} className='relative'>
                <VideoContainer
                  stream={peerStream.stream}
                  user={remoteUsers[peerStream.peerId]}
                  isMuted={false}
                  isLocal={false}
                />
              </div>
            ))}

            {localStream && (
              <div className='relative'>
                <VideoContainer
                  stream={localStream}
                  isMuted={true}
                  user={localUser}
                  isScreenShare={isScreenSharing}
                  isLocal={true}
                />
              </div>
            )}
          </div>
        )
      ) : (
        // Solo video local cuando no hay remoto
        localStream && (
          <div className='h-full w-full'>
            <VideoContainer
              stream={localStream}
              isMuted={true}
              user={localUser}
              isScreenShare={isScreenSharing}
              isLocal={true}
            />
          </div>
        )
      )}
    </div>
  );
};
