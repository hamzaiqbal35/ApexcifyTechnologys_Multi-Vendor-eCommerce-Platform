import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden lg:grid lg:grid-cols-2 animate-fade-in">
      {/* Left Side: Form */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 bg-[#F9F9F9] h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-sm lg:w-[28rem]">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#000000]">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-[#646464]">
              Join Fluxmart and start your journey today.
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-5" onSubmit={handleSubmit} autoComplete="on">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#000000] mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-[#000000] mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+1 (555) 000-0000"
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
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pr-10"
                    placeholder="Minimum 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A7A7A7] hover:text-[#000000] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#000000] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field pr-10"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A7A7A7] hover:text-[#000000] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center py-2.5 mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create account'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-[#646464]">Already have an account? </span>
              <Link to="/login" className="font-medium text-[#000000] hover:underline underline-offset-4">
                Sign in
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

export default Register;
