import { Mic, MicOff, Volume2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../utils/cn';

interface AudioLevelIndicatorProps {
  stream: MediaStream | null;
  isMuted?: boolean;
  isLocal?: boolean;
  userName?: string;
  className?: string;
  showLabel?: boolean;
}

export const AudioLevelIndicator: React.FC<AudioLevelIndicatorProps> = ({
  stream,
  isMuted = false,
  isLocal = false,
  userName,
  className,
  showLabel = true,
}) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!stream || isMuted) {
      setAudioLevel(0);
      setIsSpeaking(false);
      return;
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      return;
    }

    try {
      // Crear contexto de audio
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      source.connect(analyser);
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkAudioLevel = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Calcular nivel promedio
        const average =
          dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalizedLevel = Math.min(average / 128, 1); // Normalizar a 0-1

        setAudioLevel(normalizedLevel);

        // Determinar si está hablando (umbral de 0.1)
        setIsSpeaking(normalizedLevel > 0.1);

        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
      };

      checkAudioLevel();
    } catch (error) {
      console.error('Error creating audio analyzer:', error);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stream, isMuted]);

  // Si está silenciado, mostrar indicador de mute
  if (isMuted) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <MicOff size={16} className='text-red-500' />
        {showLabel && (
          <span className='text-xs text-gray-500'>
            {isLocal ? 'Silenciado' : `${userName || 'Usuario'} silenciado`}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Icono */}
      <div className='relative'>
        {isLocal ? (
          <Mic
            size={16}
            className={cn(
              'transition-colors',
              isSpeaking ? 'text-green-500' : 'text-gray-400'
            )}
          />
        ) : (
          <Volume2
            size={16}
            className={cn(
              'transition-colors',
              isSpeaking ? 'text-blue-500' : 'text-gray-400'
            )}
          />
        )}

        {/* Indicador de pulso cuando habla */}
        {isSpeaking && (
          <span className='absolute inset-0 flex items-center justify-center'>
            <span
              className={cn(
                'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
                isLocal ? 'bg-green-400' : 'bg-blue-400'
              )}
            />
          </span>
        )}
      </div>

      {/* Barras de nivel */}
      <div className='flex items-center gap-0.5'>
        {[...Array(5)].map((_, i) => {
          const threshold = (i + 1) * 0.2;
          const isActive = audioLevel >= threshold;

          return (
            <div
              key={i}
              className={cn(
                'w-1 rounded-sm transition-all duration-100',
                isActive
                  ? isLocal
                    ? 'bg-green-500'
                    : 'bg-blue-500'
                  : 'bg-gray-300',
                // Altura variable según la barra
                i === 0 && 'h-2',
                i === 1 && 'h-3',
                i === 2 && 'h-4',
                i === 3 && 'h-5',
                i === 4 && 'h-6'
              )}
            />
          );
        })}
      </div>

      {/* Label opcional */}
      {showLabel && userName && (
        <span
          className={cn(
            'text-xs transition-colors',
            isSpeaking ? 'text-gray-900 font-medium' : 'text-gray-500'
          )}
        >
          {userName}
        </span>
      )}
    </div>
  );
};

// Componente circular para mostrar en avatares
export const AudioLevelRing: React.FC<{
  stream: MediaStream | null;
  isMuted?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ stream, isMuted = false, size = 'md' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!stream || isMuted) {
      setIsSpeaking(false);
      return;
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      return;
    }

    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      source.connect(analyser);
      analyser.fftSize = 256;

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkAudioLevel = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        const average =
          dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalizedLevel = Math.min(average / 128, 1);

        setIsSpeaking(normalizedLevel > 0.1);

        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
      };

      checkAudioLevel();
    } catch (error) {
      console.error('Error creating audio analyzer:', error);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stream, isMuted]);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  if (!isSpeaking) {
    return null;
  }

  return (
    <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
      <div
        className={cn(
          'rounded-full border-2 border-green-500 animate-pulse',
          sizeClasses[size]
        )}
      />
      <div
        className={cn(
          'absolute rounded-full border-2 border-green-400 opacity-50 animate-ping',
          sizeClasses[size]
        )}
      />
    </div>
  );
};
