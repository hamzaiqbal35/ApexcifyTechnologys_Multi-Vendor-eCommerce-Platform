import { FileX } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({ 
  // eslint-disable-next-line no-unused-vars
  icon: Icon = FileX, 
  title = "No Items Found", 
  message = "It looks like there's nothing here yet.",
  actionText = "Go Back",
  actionLink = "/"
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-2xl border border-border">
      <div className="bg-white p-4 rounded-full shadow-sm border border-border mb-6">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-black mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mb-8">{message}</p>
      {actionText && (
        <Link to={actionLink} className="btn-primary">
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
