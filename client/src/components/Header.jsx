import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Menu, X, User as UserIcon, ShoppingBag, LogOut, Package, Hexagon } from 'lucide-react';
import logoImg from '../assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const FILE_BASE_URL = API_URL.replace(/\/api$/, '');

const getAvatarUrl = (avatar) => {
  if (!avatar) return '';
  if (avatar.startsWith('http')) return avatar;
  return `${FILE_BASE_URL}${avatar}`;
};

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isAdminUser = isAuthenticated && user?.role === 'admin';
  const shouldHideAboutContact = isAuthenticated;

  const NavLink = ({ to, children, className = '' }) => (
    <Link
      to={to}
      className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 ${
        isActive(to)
          ? 'text-black'
          : 'text-gray-500 hover:text-black'
      } ${className}`}
      onClick={() => setMobileMenuOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 md:gap-3 group focus:outline-none"
          >
            <img src={logoImg} alt="Fluxmart Logo" className="h-10 sm:h-12 md:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
            <span className="hidden sm:inline text-xl sm:text-2xl md:text-3xl font-black tracking-tighter text-[#111111] uppercase">
              FLUXMART<span className="text-[#E85002]">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            <NavLink to="/products">Store</NavLink>
            {!shouldHideAboutContact && (
              <>
                <NavLink to="/about">About</NavLink>
                <NavLink to="/contact">Contact</NavLink>
              </>
            )}
            {isAuthenticated && (
              <>

                {user.role === 'admin' && (
                  <NavLink to="/admin/dashboard">Admin</NavLink>
                )}
                {!isAdminUser && <NavLink to="/orders">Orders</NavLink>}
              </>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Cart Icon */}
                {!isAdminUser && (
                  <Link 
                    to="/cart" 
                    className="relative p-2 text-gray-500 hover:text-black transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute top-0 right-0 bg-brand-orange text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-border flex items-center justify-center text-black font-medium text-sm">
                      {user.avatar ? (
                        <img
                          src={getAvatarUrl(user.avatar)}
                          alt={user.name || 'Avatar'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-lg shadow-sm py-1 z-20 animate-fade-in">
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-medium text-black truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <UserIcon className="w-4 h-4 mr-3" />
                            Profile
                          </Link>
                          {!isAdminUser && (
                            <Link
                              to="/orders"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Package className="w-4 h-4 mr-3" />
                              Orders
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-border py-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-black"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-4 animate-fade-in">
            <nav className="flex flex-col space-y-1">
              <NavLink to="/products" className="block w-full text-left">Store</NavLink>
              {!shouldHideAboutContact && (
                <>
                  <NavLink to="/about" className="block w-full text-left">About</NavLink>
                  <NavLink to="/contact" className="block w-full text-left">Contact</NavLink>
                </>
              )}
              {isAuthenticated && (
                <>

                  {user.role === 'admin' && (
                    <NavLink to="/admin/dashboard" className="block w-full text-left">Admin Dashboard</NavLink>
                  )}
                  {!isAdminUser && (
                    <NavLink to="/orders" className="block w-full text-left">Orders</NavLink>
                  )}
                </>
              )}
              {!isAuthenticated && (
                <div className="pt-4 mt-2 border-t border-border flex flex-col space-y-2">
                  <Link to="/login" className="block w-full text-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                  <Link to="/register" className="btn-primary block w-full text-center" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
