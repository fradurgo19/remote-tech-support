import React, { useEffect, useRef } from 'react';
import { usePictureInPicture } from '../hooks/usePictureInPicture';
import { PictureInPictureBadge } from './PictureInPictureControl';
import { cn } from '../utils/cn';
import { Avatar } from '../atoms/Avatar';
import { User } from '../types';

interface PictureInPictureVideoProps {
  stream: MediaStream | null;
  isMuted?: boolean;
  user?: User;
  isScreenShare?: boolean;
  isLocal?: boolean;
  onPIPChange?: (isActive: boolean) => void;
  className?: string;
}

export const PictureInPictureVideo: React.FC<PictureInPictureVideoProps> = ({
  stream,
  isMuted = false,
  user,
  isScreenShare = false,
  isLocal = false,
  onPIPChange,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isPictureInPicture } = usePictureInPicture(videoRef);

  useEffect(() => {
    const video = videoRef.current;
    if (video && stream) {
      video.srcObject = stream;

      // Force play for local streams
      if (isLocal) {
        video.play().catch(console.error);
      }
    }

    return () => {
      if (video) {
        video.srcObject = null;
      }
    };
  }, [stream, isLocal]);

  // Notify parent component when PIP state changes
  useEffect(() => {
    if (onPIPChange) {
      onPIPChange(isPictureInPicture);
    }
  }, [isPictureInPicture, onPIPChange]);

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
    <div className={cn('relative overflow-hidden rounded-lg bg-gray-900 w-full h-full', className)}>
      {/* Badge de PIP */}
      <PictureInPictureBadge isActive={isPictureInPicture} />

      {hasActiveVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className={cn(
            'w-full h-full',
            isScreenShare ? 'object-contain bg-black' : 'object-cover'
          )}
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

// Ref forwarding version for direct access to video element
export const PictureInPictureVideoWithRef = React.forwardRef<
  HTMLVideoElement,
  Omit<PictureInPictureVideoProps, 'onPIPChange'>
>(({ stream, isMuted, user, isScreenShare, isLocal, className }, ref) => {
  useEffect(() => {
    const videoElement = ref as React.MutableRefObject<HTMLVideoElement | null>;
    if (videoElement.current && stream) {
      videoElement.current.srcObject = stream;

      if (isLocal) {
        videoElement.current.play().catch(console.error);
      }
    }
  }, [stream, isLocal, ref]);

  const hasActiveVideo = stream
    ?.getVideoTracks()
    .some(
      track =>
        track.enabled &&
        (track.readyState === 'live' || track.readyState === 'starting')
    );

  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-gray-900 w-full h-full', className)}>
      {hasActiveVideo ? (
        <video
          ref={ref}
          autoPlay
          playsInline
          muted={isMuted}
          className={cn(
            'w-full h-full',
            isScreenShare ? 'object-contain bg-black' : 'object-cover'
          )}
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
});
