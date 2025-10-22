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

      // Force play for local streams
      if (isLocal) {
        videoRef.current.play().catch(console.error);
      }
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream, isLocal]);

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
    <div className='relative h-full w-full'>
      {/* Video remoto - pantalla principal */}
      {remoteStreams.map(peerStream => (
        <div key={peerStream.peerId} className='absolute inset-0 w-full h-full'>
          <VideoContainer
            stream={peerStream.stream}
            user={remoteUsers[peerStream.peerId]}
            isLocal={false}
          />
        </div>
      ))}

      {/* Video local - Picture-in-Picture (más pequeño cuando hay alguien más) */}
      {localStream && (
        <div
          className={
            hasSomeone
              ? 'absolute bottom-4 right-4 w-64 h-48 z-10 shadow-2xl border-2 border-white/20 rounded-lg overflow-hidden'
              : 'absolute inset-0 w-full h-full'
          }
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
    </div>
  );
};
