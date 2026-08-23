import { WifiOff, RotateCcw } from 'lucide-react';

const Offline = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-lg">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-gray-500/20 blur-xl rounded-full" />
          <WifiOff className="w-24 h-24 text-gray-500 relative z-10" />
        </div>
        
        <h1 className="text-4xl font-black text-black mb-4 tracking-tighter">You are offline</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          It looks like you've lost your internet connection. Please check your network settings and try again.
        </p>
        
        <div className="flex justify-center">
          <button onClick={() => window.location.reload()} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default Offline;
