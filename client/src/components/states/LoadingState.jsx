import { Loader2 } from 'lucide-react';

const LoadingState = ({ message = "Loading...", fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        <Loader2 className="w-12 h-12 text-black animate-spin mb-4" />
        <p className="text-gray-500 font-medium">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 w-full h-full min-h-[300px]">
      <Loader2 className="w-10 h-10 text-gray-400 animate-spin mb-4" />
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

export default LoadingState;
