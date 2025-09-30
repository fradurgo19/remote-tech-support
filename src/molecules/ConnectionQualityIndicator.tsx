import { Signal, SignalHigh, SignalLow, SignalMedium } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { cn } from '../utils/cn';

interface ConnectionQualityProps {
  peerConnection: RTCPeerConnection | null;
  className?: string;
}

interface ConnectionStats {
  latency: number;
  packetLoss: number;
  bitrate: number;
  jitter: number;
}

type Quality = 'excellent' | 'good' | 'fair' | 'poor';

export const ConnectionQualityIndicator: React.FC<ConnectionQualityProps> = ({
  peerConnection,
  className,
}) => {
  const [stats, setStats] = useState<ConnectionStats>({
    latency: 0,
    packetLoss: 0,
    bitrate: 0,
    jitter: 0,
  });
  const [quality, setQuality] = useState<Quality>('good');

  useEffect(() => {
    if (!peerConnection) {
      return;
    }

    let lastBytesReceived = 0;
    let lastTimestamp = Date.now();

    const interval = setInterval(async () => {
      try {
        const statistics = await peerConnection.getStats();
        let currentLatency = 0;
        let currentPacketLoss = 0;
        let currentBitrate = 0;
        let currentJitter = 0;

        statistics.forEach(report => {
          // Estadísticas de video entrante
          if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
            // Calcular packet loss
            if (report.packetsReceived > 0) {
              currentPacketLoss =
                (report.packetsLost / report.packetsReceived) * 100;
            }

            // Calcular bitrate
            const now = Date.now();
            const timeDiff = (now - lastTimestamp) / 1000;
            if (lastBytesReceived > 0 && timeDiff > 0) {
              const bytesDiff = report.bytesReceived - lastBytesReceived;
              currentBitrate = (bytesDiff * 8) / timeDiff / 1000; // kbps
            }
            lastBytesReceived = report.bytesReceived;
            lastTimestamp = now;

            // Jitter
            currentJitter = report.jitter || 0;
          }

          // Estadísticas de candidatos (para latencia)
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            currentLatency = report.currentRoundTripTime
              ? report.currentRoundTripTime * 1000
              : 0;
          }
        });

        setStats({
          latency: Math.round(currentLatency),
          packetLoss: Math.round(currentPacketLoss * 10) / 10,
          bitrate: Math.round(currentBitrate),
          jitter: Math.round(currentJitter * 1000), // convertir a ms
        });

        // Determinar calidad basada en métricas
        const newQuality = determineQuality(
          currentLatency,
          currentPacketLoss,
          currentBitrate
        );
        setQuality(newQuality);
      } catch (error) {
        console.error('Error getting connection stats:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [peerConnection]);

  const determineQuality = (
    latency: number,
    packetLoss: number,
    bitrate: number
  ): Quality => {
    // Excelente: < 50ms latencia, < 1% pérdida, > 500 kbps
    if (latency < 50 && packetLoss < 1 && bitrate > 500) {
      return 'excellent';
    }
    // Bueno: < 100ms latencia, < 3% pérdida, > 300 kbps
    if (latency < 100 && packetLoss < 3 && bitrate > 300) {
      return 'good';
    }
    // Regular: < 200ms latencia, < 5% pérdida, > 150 kbps
    if (latency < 200 && packetLoss < 5 && bitrate > 150) {
      return 'fair';
    }
    // Pobre: todo lo demás
    return 'poor';
  };

  const getQualityConfig = (quality: Quality) => {
    switch (quality) {
      case 'excellent':
        return {
          icon: SignalHigh,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'Excelente',
          description: 'Conexión óptima',
        };
      case 'good':
        return {
          icon: SignalHigh,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          label: 'Buena',
          description: 'Conexión estable',
        };
      case 'fair':
        return {
          icon: SignalMedium,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          label: 'Regular',
          description: 'Conexión intermitente',
        };
      case 'poor':
        return {
          icon: SignalLow,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          label: 'Pobre',
          description: 'Conexión inestable',
        };
    }
  };

  if (!peerConnection) {
    return null;
  }

  const config = getQualityConfig(quality);
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Indicador compacto */}
      <div
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded-md',
          config.bgColor
        )}
      >
        <Icon size={14} className={config.color} />
        <span className={cn('text-xs font-medium', config.color)}>
          {config.label}
        </span>
        {stats.latency > 0 && (
          <span className='text-xs text-gray-500'>
            {stats.latency}ms
          </span>
        )}
      </div>

      {/* Tooltip con detalles (aparece al hover) */}
      <div className='group relative'>
        <Signal size={14} className='text-gray-400 cursor-help' />
        <div className='absolute bottom-full right-0 mb-2 hidden group-hover:block z-50'>
          <div className='bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg w-48'>
            <div className='font-semibold mb-2'>{config.description}</div>
            <div className='space-y-1'>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Latencia:</span>
                <span className='font-medium'>{stats.latency}ms</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Pérdida:</span>
                <span className='font-medium'>{stats.packetLoss}%</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Bitrate:</span>
                <span className='font-medium'>{stats.bitrate} kbps</span>
              </div>
              {stats.jitter > 0 && (
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Jitter:</span>
                  <span className='font-medium'>{stats.jitter}ms</span>
                </div>
              )}
            </div>
            {/* Flecha del tooltip */}
            <div className='absolute top-full right-4 -mt-1'>
              <div className='w-2 h-2 bg-gray-900 transform rotate-45'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente simplificado para solo mostrar el estado
export const ConnectionQualityBadge: React.FC<{
  quality: Quality;
  latency: number;
}> = ({ quality, latency }) => {
  const getConfig = (quality: Quality) => {
    switch (quality) {
      case 'excellent':
        return { icon: SignalHigh, color: 'text-green-600', label: 'Excelente' };
      case 'good':
        return { icon: SignalHigh, color: 'text-blue-600', label: 'Buena' };
      case 'fair':
        return { icon: SignalMedium, color: 'text-yellow-600', label: 'Regular' };
      case 'poor':
        return { icon: SignalLow, color: 'text-red-600', label: 'Pobre' };
    }
  };

  const config = getConfig(quality);
  const Icon = config.icon;

  return (
    <div className='flex items-center gap-1'>
      <Icon size={16} className={config.color} />
      <span className={cn('text-xs font-medium', config.color)}>
        {config.label}
      </span>
      {latency > 0 && (
        <span className='text-xs text-gray-500'>{latency}ms</span>
      )}
    </div>
  );
};
