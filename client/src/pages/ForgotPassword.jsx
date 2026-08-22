import { useState } from 'react';
import api from '../utils/api';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('If an account exists with this email, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden lg:grid lg:grid-cols-2 animate-fade-in">
      {/* Left Side: Form */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 bg-[#F9F9F9] h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#000000]">
              Forgot your password?
            </h2>
            <p className="mt-2 text-sm text-[#646464]">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit} autoComplete="on">
              {message && (
                <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-100 rounded-md">
                  {message}
                </div>
              )}
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-[#000000] mb-1">
                  Email address
                </label>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="input-field"
                  placeholder="name@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center py-2.5"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send reset link'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <Link to="/login" className="font-medium text-[#646464] hover:text-[#000000] transition-colors">
                &larr; Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Image */}
      <div className="hidden lg:block relative w-full h-full bg-[#000000]">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-90"
          src="/images/auth-bg.jpg"
          alt="Premium Authentication Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

export default ForgotPassword;
