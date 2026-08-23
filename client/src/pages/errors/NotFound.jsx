import { Link } from 'react-router-dom';
import { Ghost, Home, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-lg">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <Ghost className="w-24 h-24 text-primary relative z-10 animate-bounce" />
        </div>
        
        <h1 className="text-7xl font-black text-black mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Page not found</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link to="/products" className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2">
            <Search className="w-4 h-4" />
            Browse Store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
