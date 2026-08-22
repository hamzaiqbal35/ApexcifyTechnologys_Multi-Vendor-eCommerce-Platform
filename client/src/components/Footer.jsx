import logoImg from '../assets/logo.png';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  
  const isAuthRoute = authRoutes.some(route => location.pathname.startsWith(route));

  if (isAuthRoute) {
    return null;
  }

  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4 group cursor-pointer">
              <img src={logoImg} alt="Fluxmart Logo" className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
              <span className="text-2xl font-black tracking-tighter text-[#111111] uppercase">
                FLUXMART<span className="text-[#E85002]">.</span>
              </span>
            </div>
            <p className="text-gray-500 max-w-sm">
              The premium e-commerce platform tailored for the modern economy. Designed with precision, built for performance.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-black mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="/products" className="hover:text-black transition-colors">Store</a></li>
              <li><a href="/about" className="hover:text-black transition-colors">About</a></li>
              <li><a href="/contact" className="hover:text-black transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-black mb-4">Legal & Support</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="/help" className="hover:text-black transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Fluxmart. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-black transition-colors text-sm">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-black transition-colors text-sm">GitHub</a>
            <a href="#" className="text-gray-400 hover:text-black transition-colors text-sm">Dribbble</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
