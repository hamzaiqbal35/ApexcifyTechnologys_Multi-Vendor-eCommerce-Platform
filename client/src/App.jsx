import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import ServerStatus from './components/ServerStatus';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Help from './pages/help';

// Legal Pages
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import CookiePolicy from './pages/legal/CookiePolicy';
import RefundPolicy from './pages/legal/RefundPolicy';
import CancellationPolicy from './pages/legal/CancellationPolicy';
import ShippingPolicy from './pages/legal/ShippingPolicy';
import ReturnPolicy from './pages/legal/ReturnPolicy';
import Disclaimer from './pages/legal/Disclaimer';
import AccessibilityStatement from './pages/legal/AccessibilityStatement';
import DataProcessingAgreement from './pages/legal/DataProcessingAgreement';
import AcceptableUsePolicy from './pages/legal/AcceptableUsePolicy';
import SecurityPolicy from './pages/legal/SecurityPolicy';
import ResponsibleDisclosure from './pages/legal/ResponsibleDisclosure';
import CommunityGuidelines from './pages/legal/CommunityGuidelines';
import CookiePreferences from './pages/legal/CookiePreferences';

// Payment Pages
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentFailed from './pages/payment/PaymentFailed';
import PaymentPending from './pages/payment/PaymentPending';

// Error Pages
import NotFound from './pages/errors/NotFound';
import Forbidden from './pages/errors/Forbidden';
import ServerError from './pages/errors/ServerError';
import Maintenance from './pages/errors/Maintenance';
import Offline from './pages/errors/Offline';
import SessionExpired from './pages/errors/SessionExpired';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <div className="flex flex-col min-h-screen">
            <ServerStatus />
            <Header />
            <main className="flex-grow">
              <ToastContainer position="bottom-right" autoClose={5000} />
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders/:id" element={<OrderDetails />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/help" element={<Help />} />

                  {/* Payment Routes */}
                  <Route path="/payment/success" element={<PaymentSuccess />} />
                  <Route path="/payment/failed" element={<PaymentFailed />} />
                  <Route path="/payment/pending" element={<PaymentPending />} />

                  {/* Legal Routes */}
                  <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/legal/terms-of-service" element={<TermsOfService />} />
                  <Route path="/legal/cookie-policy" element={<CookiePolicy />} />
                  <Route path="/legal/refund-policy" element={<RefundPolicy />} />
                  <Route path="/legal/cancellation-policy" element={<CancellationPolicy />} />
                  <Route path="/legal/shipping-policy" element={<ShippingPolicy />} />
                  <Route path="/legal/return-policy" element={<ReturnPolicy />} />
                  <Route path="/legal/disclaimer" element={<Disclaimer />} />
                  <Route path="/legal/accessibility" element={<AccessibilityStatement />} />
                  <Route path="/legal/data-processing" element={<DataProcessingAgreement />} />
                  <Route path="/legal/acceptable-use" element={<AcceptableUsePolicy />} />
                  <Route path="/legal/security" element={<SecurityPolicy />} />
                  <Route path="/legal/responsible-disclosure" element={<ResponsibleDisclosure />} />
                  <Route path="/legal/community-guidelines" element={<CommunityGuidelines />} />
                  <Route path="/legal/cookie-preferences" element={<CookiePreferences />} />

                  {/* Error Routes */}
                  <Route path="/403" element={<Forbidden />} />
                  <Route path="/500" element={<ServerError />} />
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route path="/offline" element={<Offline />} />
                  <Route path="/session-expired" element={<SessionExpired />} />
                  
                  {/* Catch All - 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
