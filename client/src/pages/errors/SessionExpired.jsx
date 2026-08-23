import { Link } from 'react-router-dom';
import { Timer, LogIn } from 'lucide-react';

const SessionExpired = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-lg">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full" />
          <Timer className="w-24 h-24 text-yellow-500 relative z-10" />
        </div>
        
        <h1 className="text-4xl font-black text-black mb-4 tracking-tighter">Session Expired</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          For your security, you have been logged out due to inactivity. Please log in again to continue.
        </p>
        
        <div className="flex justify-center">
          <Link to="/login" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" />
            Sign In Again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SessionExpired;
