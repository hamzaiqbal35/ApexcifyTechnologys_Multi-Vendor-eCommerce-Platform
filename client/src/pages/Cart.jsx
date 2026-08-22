import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPricePKR } from '../utils/currency';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';

const Cart = () => {
  const { cart, loading, updateCartItem, removeFromCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-400 font-medium tracking-widest uppercase text-sm">Loading Cart...</div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-6">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-black mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 text-center max-w-sm">Looks like you haven't added anything to your cart yet.</p>
        <Link
          to="/products"
          className="btn-primary px-8 py-3 rounded-full flex items-center"
        >
          Start Shopping <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }



  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const item = cart.items.find(i => i._id === itemId);
    const product = item.product;
    if (newQuantity > product.stock) {
      Swal.fire(`Only ${product.stock} items available in stock`);
      return;
    }
    await updateCartItem(itemId, newQuantity);
  };

  const handleRemove = async (itemId) => {
    if ((await Swal.fire({ text: 'Remove this item from cart?', showCancelButton: true, confirmButtonColor: '#000', customClass: { confirmButton: 'btn-primary', cancelButton: 'btn-secondary' }, buttonsStyling: false })).isConfirmed) {
      await removeFromCart(itemId);
    }
  };

  const [shippingPrice, setShippingPrice] = useState(10);
  const [taxRate, setTaxRate] = useState(0.1);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        const settings = res.data.data;
        if (settings) {
          if (settings.shipping) {
            if (settings.shipping.isTiered && cartTotal >= settings.shipping.freeShippingThreshold) {
              setShippingPrice(0);
            } else {
              setShippingPrice(settings.shipping.flatRate);
            }
          }
          if (settings.tax && settings.tax.rate !== undefined) {
            setTaxRate(settings.tax.rate / 100);
          }
        }
      } catch (error) {
        console.error('Failed to fetch shipping settings:', error);
      }
    };
    if (cartTotal > 0) {
      fetchSettings();
    }
  }, [cartTotal]);

  const taxPrice = cartTotal * taxRate;
  const totalPrice = cartTotal + shippingPrice + taxPrice;

  return (
    <div className="container mx-auto px-6 py-12 lg:py-20 animate-fade-in min-h-screen">
      <h1 className="text-3xl font-bold tracking-tight text-black mb-10">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="border-t border-border">
            {cart.items.map((item) => {
              const product = item.product;
              return (
                <div key={item._id} className="py-8 border-b border-border flex flex-col sm:flex-row gap-6 group">
                  <Link to={`/products/${product._id}`} className="shrink-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 border border-border rounded-xl overflow-hidden flex items-center justify-center p-2">
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/150'}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105"
                      />
                    </div>
                  </Link>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Link to={`/products/${product._id}`}>
                          <h3 className="font-semibold text-black text-lg hover:underline underline-offset-4 line-clamp-1">{product.name}</h3>
                        </Link>
                        <p className="text-gray-500 text-sm mt-1">{formatPricePKR(product.price)} each</p>
                      </div>
                      <p className="font-semibold text-black text-lg text-right">
                        {formatPricePKR((product.price || item.price) * item.quantity)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border rounded-lg h-10 bg-white">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 transition-colors rounded-l-lg"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-12 text-center text-sm font-medium text-black border-x border-border h-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 transition-colors rounded-r-lg"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-2"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-gray-50 border border-border rounded-2xl p-8 sticky top-24">
            <h2 className="text-lg font-bold tracking-tight text-black mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6 pb-6 border-b border-border text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-black font-medium">{formatPricePKR(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-black font-medium">{formatPricePKR(shippingPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax ({taxRate * 100}%)</span>
                <span className="text-black font-medium">{formatPricePKR(taxPrice)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-8">
              <span className="text-base font-bold text-black">Total</span>
              <span className="text-2xl font-bold tracking-tight text-black">{formatPricePKR(totalPrice)}</span>
            </div>
            
            <Link
              to="/checkout"
              className="btn-primary w-full py-4 text-base font-semibold flex justify-center shadow-sm"
            >
              Checkout
            </Link>
            
            <div className="mt-6 text-center">
              <Link to="/products" className="text-sm font-medium text-gray-500 hover:text-black transition-colors underline-offset-4 hover:underline flex items-center justify-center">
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
