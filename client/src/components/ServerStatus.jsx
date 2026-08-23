import { useEffect, useState } from 'react';
import api from '../utils/api';
import { AlertCircle } from 'lucide-react';

const ServerStatus = () => {
  const [serverOnline, setServerOnline] = useState(true);

  useEffect(() => {
    const checkServer = async () => {
      try {
        await api.get('/health');
        setServerOnline(true);
      } catch {
        setServerOnline(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, []);

  if (serverOnline) return null;

  return (
    <div className="bg-black text-white px-4 py-3 flex items-center justify-center text-sm">
      <AlertCircle className="w-4 h-4 mr-2" />
      <span>
        We are currently experiencing high traffic or undergoing maintenance. Please try again later.
      </span>
    </div>
  );
};

export default ServerStatus;
