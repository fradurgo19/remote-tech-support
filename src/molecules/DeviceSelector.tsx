import React, { useState, useEffect } from 'react';
import { Button } from '../atoms/Button';
import { Card, CardContent } from '../atoms/Card';
import { Camera, Mic, ChevronDown, Check } from 'lucide-react';
import { webRTCService, MediaDevice } from '../services/webrtc';
import { cn } from '../utils/cn';

interface DeviceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceChange?: (deviceId: string, type: 'video' | 'audio') => void;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  isOpen,
  onClose,
  onDeviceChange,
}) => {
  const [videoDevices, setVideoDevices] = useState<MediaDevice[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDevice[]>([]);
  const [currentVideoDevice, setCurrentVideoDevice] = useState<string | null>(null);
  const [currentAudioDevice, setCurrentAudioDevice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDevices();
      setCurrentVideoDevice(webRTCService.getCurrentVideoDeviceId());
      setCurrentAudioDevice(webRTCService.getCurrentAudioDeviceId());
    }
  }, [isOpen]);

  useEffect(() => {
    const unsubscribe = webRTCService.onDevicesChange((devices) => {
      const videos = devices.filter(d => d.kind === 'videoinput');
      const audios = devices.filter(d => d.kind === 'audioinput');
      setVideoDevices(videos);
      setAudioDevices(audios);
    });

    return unsubscribe;
  }, []);

  const loadDevices = async () => {
    try {
      const devices = await webRTCService.enumerateDevices();
      const videos = devices.filter(d => d.kind === 'videoinput');
      const audios = devices.filter(d => d.kind === 'audioinput');
      setVideoDevices(videos);
      setAudioDevices(audios);
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  const handleVideoDeviceChange = async (deviceId: string) => {
    setIsLoading(true);
    try {
      await webRTCService.switchCamera(deviceId);
      setCurrentVideoDevice(deviceId);
      onDeviceChange?.(deviceId, 'video');
    } catch (error) {
      console.error('Error switching camera:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioDeviceChange = async (deviceId: string) => {
    setIsLoading(true);
    try {
      await webRTCService.switchMicrophone(deviceId);
      setCurrentAudioDevice(deviceId);
      onDeviceChange?.(deviceId, 'audio');
    } catch (error) {
      console.error('Error switching microphone:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Seleccionar Dispositivos</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          <div className="space-y-6">
            {/* Video Devices */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Camera size={18} className="text-primary" />
                <h4 className="font-medium">Cámaras</h4>
              </div>
              <div className="space-y-2">
                {videoDevices.length > 0 ? (
                  videoDevices.map((device) => (
                    <button
                      key={device.deviceId}
                      onClick={() => handleVideoDeviceChange(device.deviceId)}
                      disabled={isLoading}
                      className={cn(
                        'w-full text-left p-3 rounded-md border transition-colors',
                        'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary',
                        currentVideoDevice === device.deviceId
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {device.label}
                        </span>
                        {currentVideoDevice === device.deviceId && (
                          <Check size={16} className="text-primary flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No se encontraron cámaras
                  </p>
                )}
              </div>
            </div>

            {/* Audio Devices */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Mic size={18} className="text-primary" />
                <h4 className="font-medium">Micrófonos</h4>
              </div>
              <div className="space-y-2">
                {audioDevices.length > 0 ? (
                  audioDevices.map((device) => (
                    <button
                      key={device.deviceId}
                      onClick={() => handleAudioDeviceChange(device.deviceId)}
                      disabled={isLoading}
                      className={cn(
                        'w-full text-left p-3 rounded-md border transition-colors',
                        'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary',
                        currentAudioDevice === device.deviceId
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {device.label}
                        </span>
                        {currentAudioDevice === device.deviceId && (
                          <Check size={16} className="text-primary flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No se encontraron micrófonos
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};