import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const SuccessState = ({ 
  title = "Action Successful", 
  message = "Your request has been completed successfully.",
  actionText = "Continue",
  actionLink = "/"
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-green-50 rounded-2xl border border-green-100 text-center">
      <div className="bg-white p-4 rounded-full shadow-sm border border-green-100 mb-6">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </div>
      <h3 className="text-xl font-bold text-green-800 mb-3">{title}</h3>
      <p className="text-green-700/80 max-w-md mb-8">{message}</p>
      
      {actionText && (
        <Link 
          to={actionLink}
          className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors shadow-sm"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default SuccessState;
