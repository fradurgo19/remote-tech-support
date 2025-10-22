import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socket';

export const SocketDebugInfo: React.FC = () => {
  const { user } = useAuth();
  const [socketStatus, setSocketStatus] = useState({
    connected: false,
    serverAvailable: false,
    socketId: null,
  });

  useEffect(() => {
    const updateStatus = () => {
      setSocketStatus({
        connected: socketService.isConnected(),
        serverAvailable: socketService.isServerAvailableStatus(),
        socketId: socketService.getSocket()?.id || null,
      });
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const handleReconnect = () => {
    socketService.reconnect();
  };

  return (
    <div className='fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50'>
      <div className='font-bold mb-2'>Socket Debug Info</div>
      <div>User: {user?.name || 'Not logged in'}</div>
      <div>Socket ID: {socketStatus.socketId || 'None'}</div>
      <div>Connected: {socketStatus.connected ? '✅' : '❌'}</div>
      <div>Server Available: {socketStatus.serverAvailable ? '✅' : '❌'}</div>
      <div>Token: {localStorage.getItem('authToken') ? '✅' : '❌'}</div>
      {!socketStatus.connected && (
        <button
          onClick={handleReconnect}
          className='mt-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700'
        >
          Reconectar
        </button>
      )}
    </div>
  );
};
