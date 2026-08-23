import { Link } from 'react-router-dom';
import { ServerCrash, RotateCcw, Home } from 'lucide-react';

const ServerError = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-lg">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
          <ServerCrash className="w-24 h-24 text-orange-500 relative z-10" />
        </div>
        
        <h1 className="text-7xl font-black text-black mb-4 tracking-tighter">500</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Internal Server Error</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Oops! Something went wrong on our end. Our team has been notified and we are working to fix the issue.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => window.location.reload()} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          <Link to="/" className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServerError;
