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
  const [hasHighContrastContent, setHasHighContrastContent] =
    React.useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    // Evitar establecer srcObject si ya es el mismo stream para prevenir interrupciones
    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    // Asegurar que los tracks de audio estén habilitados para streams remotos
    if (!isLocal) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        if (!track.enabled) {
          track.enabled = true;
          console.log(
            `🔊 Remoto: Audio track enabled=${track.enabled}, muted=${track.muted}`
          );
        }
      });

      // Asegurar que los tracks de video estén habilitados para streams remotos
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach(track => {
        if (!track.enabled) {
          console.log('📹 Forcing video track to be enabled in VideoContainer');
          track.enabled = true;
        }
        console.log(
          `🎥 Remoto: Video track enabled=${track.enabled}, readyState=${track.readyState}, muted=${track.muted}`
        );
      });
    }

    // Configurar muted antes de intentar reproducir
    video.muted = isLocal ? true : isMuted;

    // Intentar reproducir con manejo de errores mejorado
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // Ignorar errores de AbortError ya que son esperados cuando el video se reemplaza
        if (error.name !== 'AbortError') {
          console.error('Error al reproducir video:', error);
        }
      });
    }

    return () => {
      // No limpiar srcObject aquí para evitar interrupciones innecesarias
      // El cleanup se manejará cuando el componente se desmonte completamente
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
      videoTracks.forEach(track => {
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

  // Detectar contenido de alto contraste (pantallas con texto) para optimizar filtros
  useEffect(() => {
    if (!videoRef.current || isLocal || !hasActiveVideo) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) return;

    const checkContrast = () => {
      try {
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;

        if (canvas.width === 0 || canvas.height === 0) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Analizar contraste: buscar áreas con alto contraste (típico de texto en pantallas)
        let highContrastPixels = 0;
        const sampleSize = Math.min(10000, data.length / 4); // Muestrear hasta 10k píxeles

        for (let i = 0; i < sampleSize; i++) {
          const idx = Math.floor(Math.random() * (data.length / 4)) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const brightness = (r + g + b) / 3;

          // Verificar contraste con píxeles vecinos
          if (idx + 4 < data.length) {
            const nextR = data[idx + 4];
            const nextG = data[idx + 5];
            const nextB = data[idx + 6];
            const nextBrightness = (nextR + nextG + nextB) / 3;
            const contrast = Math.abs(brightness - nextBrightness);

            if (contrast > 100) {
              // Alto contraste (texto típicamente tiene >100)
              highContrastPixels++;
            }
          }
        }

        // Si más del 5% de los píxeles muestran alto contraste, probablemente hay texto/pantalla
        const highContrastRatio = highContrastPixels / sampleSize;
        setHasHighContrastContent(highContrastRatio > 0.05);
      } catch (error) {
        // Silenciar errores de canvas (puede fallar por CORS)
        console.debug('Canvas analysis skipped:', error);
      }
    };

    // Verificar cada 2 segundos para no sobrecargar
    const interval = setInterval(checkContrast, 2000);
    checkContrast(); // Primera verificación inmediata

    return () => clearInterval(interval);
  }, [stream, hasActiveVideo, isLocal]);

  // Detectar si es PC para aplicar mejoras de renderizado (opción 2 y 6)
  const isPC =
    typeof window !== 'undefined' &&
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
          data-high-contrast={hasHighContrastContent ? 'true' : 'false'}
          className={`w-full h-full ${
            isScreenShare ? 'object-contain bg-black' : 'object-cover'
          } ${
            // Opción 2 y 6: Mejora de renderizado para video remoto en PC
            !isLocal && isPC
              ? 'video-enhancement video-remote-brightness-fix'
              : ''
          }`}
          style={
            // Opción 6: Upscaling inteligente con filtros CSS + Ajuste de brillo optimizado para remotos
            !isLocal && isPC
              ? {
                  imageRendering: 'crisp-edges' as const,
                  // Ajuste dinámico según contenido: más brillo si hay texto/pantalla
                  filter: hasHighContrastContent
                    ? 'brightness(0.9) contrast(1.5) saturate(1.1)' // Más brillo y contraste para texto
                    : 'brightness(0.85) contrast(1.4) saturate(1.1)', // Brillo intermedio para video normal
                  transform: 'scale(1)',
                  willChange: 'filter',
                  // Mejorar renderizado de texto y bordes
                  textRendering: 'optimizeLegibility' as const,
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
