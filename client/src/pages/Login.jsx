import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
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
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-[#646464]">
              Enter your details to access your account.
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit} autoComplete="on">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#000000] mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#000000] mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pr-10"
                    placeholder=""
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A7A7A7] hover:text-[#000000] transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-[#646464] hover:text-[#000000] transition-colors">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center py-2.5"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-[#646464]">Don't have an account? </span>
              <Link to="/register" className="font-medium text-[#000000] hover:underline underline-offset-4">
                Sign up
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

export default Login;
