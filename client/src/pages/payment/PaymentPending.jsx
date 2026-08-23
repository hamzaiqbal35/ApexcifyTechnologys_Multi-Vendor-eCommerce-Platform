import { Loader } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentPending = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, you would poll your backend or wait for a webhook to navigate to success/fail
    // For now, we simulate a check
    const timer = setTimeout(() => {
      // Simulate successful payment after 5 seconds
      // navigate('/payment/success');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-lg bg-white p-12 rounded-3xl shadow-sm border border-border">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full" />
            <Loader className="w-20 h-20 text-blue-500 relative z-10 animate-spin" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-black mb-4 tracking-tighter">Processing Payment</h1>
        <p className="text-gray-500 mb-4 leading-relaxed">
          Please wait while we confirm your payment securely. Do not close this window or click the back button.
        </p>
        
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-8">
          <div className="h-full bg-blue-500 animate-[pulse_2s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;
