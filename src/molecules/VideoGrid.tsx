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
    const video = videoRef.current;
    if (video && stream) {
      video.srcObject = stream;

      // Forzar reproducción para todos los videos (local y remoto)
      video.play().catch(err => {
        console.error(`Error al reproducir video:`, err);
      });
    }

    return () => {
      if (video) {
        video.srcObject = null;
      }
    };
  }, [stream, isLocal, user]);

  // Force video element update when stream tracks change
  useEffect(() => {
    if (!stream) return;
    
    const videoTracks = stream.getVideoTracks();
    const video = videoRef.current;
    
    if (video && videoTracks.length > 0) {
      // Force a small delay to ensure track is ready
      const timer = setTimeout(() => {
        if (video && video.srcObject !== stream) {
          video.srcObject = stream;
          if (isLocal) {
            video.play().catch(console.error);
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [stream, isLocal]);

  // Check if video track is active
  const hasActiveVideo = stream
    ?.getVideoTracks()
    .some(
      track =>
        track.enabled &&
        (track.readyState === 'live' || track.readyState === 'starting')
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
          }`}
        />
      ) : (
        <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900'>
          <div className='text-center p-6'>
            <div className='mb-4'>
              <Avatar src={user?.avatar} size='xl' status={user?.status} />
            </div>
            <p className='text-white text-lg font-medium mb-2'>
              {user?.name || 'Usuario'}
            </p>
            <p className='text-gray-400 text-sm'>
              {isLocal
                ? '📹 Tu cámara está desactivada'
                : '📹 Cámara no disponible'}
            </p>
            {!isLocal && (
              <p className='text-xs text-gray-500 mt-2'>
                (El otro usuario puede no tener cámara o está en uso)
              </p>
            )}
          </div>
        </div>
      )}

      {user && (
        <div className='absolute bottom-2 left-2 flex items-center gap-2 bg-gray-900/90 px-3 py-2 rounded-lg backdrop-blur-sm border border-white/20'>
          <Avatar src={user.avatar} size='sm' status={user.status} />
          <div className='flex flex-col'>
            <span className='text-white text-sm font-medium'>
              {user.name}
            </span>
            <span className={`text-xs ${isLocal ? 'text-green-400' : 'text-blue-400'}`}>
              {isLocal ? '🟢 Tú (Local)' : '🔵 Remoto'}
            </span>
          </div>
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
  activeCameraStreams?: Map<string, MediaStream>;
  activeCameraIds?: string[];
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  remoteStreams,
  localUser,
  remoteUsers = {},
  isScreenSharing,
  activeCameraStreams = new Map(),
  activeCameraIds = [],
}) => {
  const getGridClassName = () => {
    const totalStreams =
      (localStream ? 1 : 0) + remoteStreams.length + activeCameraStreams.size;

    if (totalStreams === 1) {
      return 'grid-cols-1 grid-rows-1';
    } else if (totalStreams === 2) {
      return 'grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1';
    } else if (totalStreams <= 4) {
      return 'grid-cols-2 grid-rows-2';
    } else if (totalStreams <= 6) {
      return 'grid-cols-2 md:grid-cols-3 grid-rows-3';
    } else {
      return 'grid-cols-3 md:grid-cols-4 grid-rows-3 md:grid-rows-4';
    }
  };

  // Logging solo para desarrollo (se puede remover en producción)
  // useEffect(() => {
  //   console.log('VideoGrid:', {
  //     local: !!localStream,
  //     remote: remoteStreams.length,
  //     cameras: activeCameraStreams.size,
  //   });
  // }, [localStream, remoteStreams, activeCameraStreams]);

  if (
    !localStream &&
    remoteStreams.length === 0 &&
    activeCameraStreams.size === 0
  ) {
    return (
      <div className='flex flex-col items-center justify-center h-full bg-gray-900 rounded-lg'>
        <div className='text-white text-xl mb-4'>No hay video activo</div>
        <p className='text-gray-400 text-sm text-center'>
          La cámara está desactivada o la llamada aún no ha comenzado
        </p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 h-full ${getGridClassName()}`}>
      {localStream && (
        <div
          className={`relative ${
            remoteStreams.length > 0 ? 'md:col-span-1' : 'col-span-full'
          }`}
        >
          <VideoContainer
            stream={localStream}
            isMuted={true}
            user={localUser}
            isScreenShare={isScreenSharing}
            isLocal={true}
          />
        </div>
      )}

      {remoteStreams.map(peerStream => (
        <div
          key={peerStream.peerId}
          className={
            remoteStreams.length === 1 &&
            !localStream &&
            activeCameraStreams.size === 0
              ? 'col-span-full'
              : 'md:col-span-1'
          }
        >
          <VideoContainer
            stream={peerStream.stream}
            user={remoteUsers[peerStream.peerId]}
            isLocal={false}
          />
        </div>
      ))}

      {/* Multiple camera streams */}
      {Array.from(activeCameraStreams.entries()).map(([deviceId, stream]) => (
        <div key={`camera-${deviceId}`} className='md:col-span-1'>
          <VideoContainer
            stream={stream}
            user={localUser}
            isLocal={true}
            isMuted={true}
          />
          <div className='absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded'>
            Cámara {activeCameraIds.indexOf(deviceId) + 1}
          </div>
        </div>
      ))}
    </div>
  );
};
