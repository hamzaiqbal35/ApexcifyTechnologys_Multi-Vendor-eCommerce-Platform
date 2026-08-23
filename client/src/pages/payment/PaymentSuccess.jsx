import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

const PaymentSuccess = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-lg bg-white p-12 rounded-3xl shadow-sm border border-border">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
            <CheckCircle className="w-20 h-20 text-green-500 relative z-10" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-black mb-4 tracking-tighter">Payment Successful!</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Thank you for your purchase. Your order has been placed and is currently being processed. You will receive an email confirmation shortly.
        </p>
        
        <div className="flex flex-col gap-4">
          <Link to="/orders" className="btn-primary flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            View Orders
          </Link>
          <Link to="/products" className="text-sm font-medium text-black hover:text-primary transition-colors flex items-center justify-center gap-2">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
