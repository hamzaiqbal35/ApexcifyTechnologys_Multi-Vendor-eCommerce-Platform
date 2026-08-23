import { Link } from 'react-router-dom';
import { ShieldAlert, Home, LogIn } from 'lucide-react';

const Forbidden = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-lg">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
          <ShieldAlert className="w-24 h-24 text-red-500 relative z-10" />
        </div>
        
        <h1 className="text-7xl font-black text-black mb-4 tracking-tighter">403</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          You do not have permission to view this directory or page using the credentials that you supplied.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link to="/login" className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
