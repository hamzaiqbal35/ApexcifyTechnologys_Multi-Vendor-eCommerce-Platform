import { Link } from 'react-router-dom';
import { XCircle, RefreshCcw, HeadphonesIcon } from 'lucide-react';

const PaymentFailed = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-lg bg-white p-12 rounded-3xl shadow-sm border border-border">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
            <XCircle className="w-20 h-20 text-red-500 relative z-10" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-black mb-4 tracking-tighter">Payment Failed</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          We couldn't process your payment. Please check your payment details and try again, or use a different payment method.
        </p>
        
        <div className="flex flex-col gap-4">
          <Link to="/checkout" className="btn-primary flex items-center justify-center gap-2">
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </Link>
          <Link to="/contact" className="text-sm font-medium text-black hover:text-primary transition-colors flex items-center justify-center gap-2">
            Contact Support <HeadphonesIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
