import { AlertTriangle } from 'lucide-react';

const ErrorState = ({ 
  title = "Something went wrong", 
  message = "An unexpected error occurred while processing your request.",
  onRetry = null 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-red-50 rounded-2xl border border-red-100 text-center">
      <div className="bg-white p-3 rounded-full shadow-sm border border-red-100 mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-red-800 mb-2">{title}</h3>
      <p className="text-red-600/80 max-w-sm mb-6 text-sm">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-6 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 font-medium transition-colors text-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
