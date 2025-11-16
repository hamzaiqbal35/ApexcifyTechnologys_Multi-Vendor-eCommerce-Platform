import { useEffect, useState } from 'react';
import api from '../utils/api';

const ServerStatus = () => {
  const [serverOnline, setServerOnline] = useState(true);

  useEffect(() => {
    const checkServer = async () => {
      try {
        await api.get('/health');
        setServerOnline(true);
      } catch (error) {
        setServerOnline(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (serverOnline) return null;

  return (
    <div className="bg-yellow-500 text-white px-4 py-2 text-center">
      <p className="font-semibold">
        ⚠️ Backend server is not running. Please start the server with: <code className="bg-yellow-600 px-2 py-1 rounded">cd server && npm run dev</code>
      </p>
    </div>
  );
};

export default ServerStatus;

