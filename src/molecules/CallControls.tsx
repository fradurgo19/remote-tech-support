import React from 'react';
import { Button } from '../atoms/Button';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  MonitorUp, Monitor, Circle, Square, Settings
} from 'lucide-react';

interface CallControlsProps {
  videoEnabled: boolean;
  audioEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onEndCall: () => void;
  onOpenDeviceSettings?: () => void;
}

export const CallControls: React.FC<CallControlsProps> = ({
  videoEnabled,
  audioEnabled,
  isScreenSharing,
  isRecording,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onToggleRecording,
  onEndCall,
  onOpenDeviceSettings,
}) => {
  return (
    <div className="flex items-center justify-center space-x-3 bg-gray-800/90 p-3 rounded-lg backdrop-blur-sm">
      <Button
        variant={audioEnabled ? 'ghost' : 'destructive'}
        size="icon"
        onClick={onToggleAudio}
        aria-label={audioEnabled ? 'Silenciar micrófono' : 'Activar micrófono'}
        className="transition-all duration-200 ease-in-out"
      >
        {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
      </Button>
      
      <Button
        variant={videoEnabled ? 'ghost' : 'destructive'}
        size="icon"
        onClick={onToggleVideo}
        aria-label={videoEnabled ? 'Apagar cámara' : 'Encender cámara'}
        className="transition-all duration-200 ease-in-out"
      >
        {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
      </Button>
      
      <Button
        variant={isScreenSharing ? 'secondary' : 'ghost'}
        size="icon"
        onClick={onToggleScreenShare}
        aria-label={isScreenSharing ? 'Dejar de compartir pantalla' : 'Compartir pantalla'}
        className="transition-all duration-200 ease-in-out"
      >
        {isScreenSharing ? <Monitor size={20} /> : <MonitorUp size={20} />}
      </Button>
      
      <Button
        variant={isRecording ? 'secondary' : 'ghost'}
        size="icon"
        onClick={onToggleRecording}
        aria-label={isRecording ? 'Detener grabación' : 'Iniciar grabación'}
        className={`transition-all duration-200 ease-in-out ${isRecording ? 'animate-pulse' : ''}`}
      >
        {isRecording ? <Square size={20} className="text-destructive" /> : <Circle size={20} />}
      </Button>

      {onOpenDeviceSettings && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenDeviceSettings}
          aria-label="Configurar dispositivos"
          className="transition-all duration-200 ease-in-out"
        >
          <Settings size={20} />
        </Button>
      )}
      
      <Button
        variant="destructive"
        size="icon"
        onClick={onEndCall}
        aria-label="Finalizar llamada"
        className="transition-all duration-200 ease-in-out"
      >
        <PhoneOff size={20} />
      </Button>
    </div>
  );
};