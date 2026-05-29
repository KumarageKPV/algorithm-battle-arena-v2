import { useState, useEffect } from 'react';
import chatSignalR from '../services/chatSignalR';
import { getToken } from '../services/tokenStorage';

const ChatDebug = () => {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkToken = () => {
      const currentToken = getToken();
      setToken(currentToken ? 'Present' : 'Missing');
    };

    const checkConnection = () => {
      setConnectionState(chatSignalR.connectionState);
    };

    checkToken();
    checkConnection();

    const interval = setInterval(() => {
      checkConnection();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const testConnection = async () => {
    try {
      setError(null);
      await chatSignalR.start();
      setConnectionState(chatSignalR.connectionState);
    } catch (err) {
      setError(err.message);
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <h4 className="font-bold mb-2">Chat Debug</h4>
      <div className="space-y-1">
        <div>Token: <span className={token === 'Present' ? 'text-green-400' : 'text-red-400'}>{token}</span></div>
        <div>Connection: <span className={
          connectionState === 'connected' ? 'text-green-400' : 
          connectionState === 'connecting' ? 'text-yellow-400' : 'text-red-400'
        }>{connectionState}</span></div>
        {error && <div className="text-red-400">Error: {error}</div>}
        <button 
          onClick={testConnection}
          className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-xs mt-2"
        >
          Test Connection
        </button>
      </div>
    </div>
  );
};

export default ChatDebug;