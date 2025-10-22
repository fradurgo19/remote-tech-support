import {
  Activity,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Upload,
  Video,
  Wifi,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '../atoms/Button';
import { Card, CardContent } from '../atoms/Card';
import { cn } from '../utils/cn';

interface CallStatsProps {
  peerConnection: RTCPeerConnection | null;
  startTime: number | null;
  className?: string;
}

interface DetailedStats {
  // Video
  videoResolution: string;
  videoFps: number;
  videoBitrate: number;
  videoCodec: string;

  // Audio
  audioBitrate: number;
  audioCodec: string;

  // Network
  packetsSent: number;
  packetsReceived: number;
  packetsLost: number;
  packetLoss: number;
  jitter: number;
  roundTripTime: number;

  // Bandwidth
  bytesSent: number;
  bytesReceived: number;
  currentBitrate: number;
}

export const CallStatsPanel: React.FC<CallStatsProps> = ({
  peerConnection,
  startTime,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [stats, setStats] = useState<DetailedStats>({
    videoResolution: '0x0',
    videoFps: 0,
    videoBitrate: 0,
    videoCodec: '',
    audioBitrate: 0,
    audioCodec: '',
    packetsSent: 0,
    packetsReceived: 0,
    packetsLost: 0,
    packetLoss: 0,
    jitter: 0,
    roundTripTime: 0,
    bytesSent: 0,
    bytesReceived: 0,
    currentBitrate: 0,
  });

  // Actualizar duración cada segundo
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Obtener estadísticas detalladas
  useEffect(() => {
    if (!peerConnection) return;

    let lastBytesSent = 0;
    let lastBytesReceived = 0;
    let lastTimestamp = Date.now();

    const interval = setInterval(async () => {
      try {
        const statistics = await peerConnection.getStats();
        const newStats: Partial<DetailedStats> = {};

        statistics.forEach(report => {
          // Estadísticas de video entrante
          if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
            newStats.videoResolution = `${report.frameWidth || 0}x${
              report.frameHeight || 0
            }`;
            newStats.videoFps = report.framesPerSecond || 0;
            newStats.videoCodec = report.mimeType?.split('/')[1] || '';

            // Calcular bitrate de video
            const now = Date.now();
            const timeDiff = (now - lastTimestamp) / 1000;
            if (lastBytesReceived > 0 && timeDiff > 0) {
              const bytesDiff = report.bytesReceived - lastBytesReceived;
              newStats.videoBitrate = Math.round(
                (bytesDiff * 8) / timeDiff / 1000
              );
            }
          }

          // Estadísticas de audio entrante
          if (report.type === 'inbound-rtp' && report.mediaType === 'audio') {
            newStats.audioCodec = report.mimeType?.split('/')[1] || '';
            newStats.packetsReceived = report.packetsReceived || 0;
            newStats.packetsLost = report.packetsLost || 0;
            newStats.jitter = Math.round((report.jitter || 0) * 1000);

            if (report.packetsReceived > 0) {
              newStats.packetLoss = Number(
                (
                  (report.packetsLost / report.packetsReceived) *
                  100
                ).toFixed(2)
              );
            }
          }

          // Estadísticas de paquetes salientes
          if (report.type === 'outbound-rtp') {
            newStats.packetsSent = report.packetsSent || 0;
          }

          // Estadísticas de candidatos
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            newStats.roundTripTime = Math.round(
              (report.currentRoundTripTime || 0) * 1000
            );
            newStats.bytesSent = report.bytesSent || 0;
            newStats.bytesReceived = report.bytesReceived || 0;

            // Calcular bitrate total
            const now = Date.now();
            const timeDiff = (now - lastTimestamp) / 1000;
            if (timeDiff > 0) {
              const sentDiff = report.bytesSent - lastBytesSent;
              const receivedDiff = report.bytesReceived - lastBytesReceived;
              newStats.currentBitrate = Math.round(
                ((sentDiff + receivedDiff) * 8) / timeDiff / 1000
              );
            }

            lastBytesSent = report.bytesSent;
            lastBytesReceived = report.bytesReceived;
            lastTimestamp = now;
          }
        });

        setStats(prev => ({ ...prev, ...newStats }));
      } catch (error) {
        console.error('Error getting detailed stats:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [peerConnection]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (!peerConnection || !startTime) {
    return null;
  }

  return (
    <Card className={cn('', className)}>
      <CardContent className='p-3'>
        {/* Header compacto */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Activity size={16} className='text-blue-600' />
            <span className='text-sm font-medium'>Estadísticas</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1 text-xs text-gray-500'>
              <Clock size={12} />
              <span className='font-mono'>{formatDuration(duration)}</span>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsExpanded(!isExpanded)}
              className='h-6 w-6 p-0'
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
          </div>
        </div>

        {/* Vista resumida (siempre visible) */}
        <div className='grid grid-cols-3 gap-2 mt-2'>
          <div className='text-center'>
            <div className='text-xs text-gray-500'>Latencia</div>
            <div className='text-sm font-semibold'>{stats.roundTripTime}ms</div>
          </div>
          <div className='text-center'>
            <div className='text-xs text-gray-500'>FPS</div>
            <div className='text-sm font-semibold'>{stats.videoFps}</div>
          </div>
          <div className='text-center'>
            <div className='text-xs text-gray-500'>Pérdida</div>
            <div className='text-sm font-semibold'>{stats.packetLoss}%</div>
          </div>
        </div>

        {/* Vista expandida */}
        {isExpanded && (
          <div className='mt-3 pt-3 border-t space-y-3'>
            {/* Video Stats */}
            <div>
              <div className='flex items-center gap-1 mb-2'>
                <Video size={14} className='text-blue-600' />
                <span className='text-xs font-semibold text-gray-700'>
                  Video
                </span>
              </div>
              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div>
                  <span className='text-gray-500'>Resolución:</span>
                  <span className='ml-1 font-medium'>
                    {stats.videoResolution}
                  </span>
                </div>
                <div>
                  <span className='text-gray-500'>Codec:</span>
                  <span className='ml-1 font-medium'>
                    {stats.videoCodec || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className='text-gray-500'>FPS:</span>
                  <span className='ml-1 font-medium'>{stats.videoFps}</span>
                </div>
                <div>
                  <span className='text-gray-500'>Bitrate:</span>
                  <span className='ml-1 font-medium'>
                    {stats.videoBitrate} kbps
                  </span>
                </div>
              </div>
            </div>

            {/* Network Stats */}
            <div>
              <div className='flex items-center gap-1 mb-2'>
                <Wifi size={14} className='text-green-600' />
                <span className='text-xs font-semibold text-gray-700'>
                  Red
                </span>
              </div>
              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div>
                  <span className='text-gray-500'>Latencia:</span>
                  <span className='ml-1 font-medium'>
                    {stats.roundTripTime}ms
                  </span>
                </div>
                <div>
                  <span className='text-gray-500'>Jitter:</span>
                  <span className='ml-1 font-medium'>{stats.jitter}ms</span>
                </div>
                <div>
                  <span className='text-gray-500'>Pérdida:</span>
                  <span className='ml-1 font-medium'>{stats.packetLoss}%</span>
                </div>
                <div>
                  <span className='text-gray-500'>Bitrate:</span>
                  <span className='ml-1 font-medium'>
                    {stats.currentBitrate} kbps
                  </span>
                </div>
              </div>
            </div>

            {/* Bandwidth Stats */}
            <div>
              <div className='flex items-center gap-1 mb-2'>
                <Activity size={14} className='text-purple-600' />
                <span className='text-xs font-semibold text-gray-700'>
                  Tráfico
                </span>
              </div>
              <div className='space-y-1'>
                <div className='flex items-center justify-between text-xs'>
                  <div className='flex items-center gap-1'>
                    <Upload size={12} className='text-blue-500' />
                    <span className='text-gray-500'>Enviado:</span>
                  </div>
                  <span className='font-medium'>
                    {formatBytes(stats.bytesSent)}
                  </span>
                </div>
                <div className='flex items-center justify-between text-xs'>
                  <div className='flex items-center gap-1'>
                    <Download size={12} className='text-green-500' />
                    <span className='text-gray-500'>Recibido:</span>
                  </div>
                  <span className='font-medium'>
                    {formatBytes(stats.bytesReceived)}
                  </span>
                </div>
              </div>
            </div>

            {/* Packets */}
            <div className='text-xs text-gray-500'>
              <div>Paquetes enviados: {stats.packetsSent.toLocaleString()}</div>
              <div>
                Paquetes recibidos: {stats.packetsReceived.toLocaleString()}
              </div>
              <div>Paquetes perdidos: {stats.packetsLost.toLocaleString()}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
