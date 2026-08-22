import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPricePKR } from '../utils/currency';
import { Loader2, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ cart, cartTotal, shippingPrice, taxRate, taxPrice, totalPrice }) => {
  const { user, updateUser } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [formData, setFormData] = useState({
    shippingAddress: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || ''
    },
    paymentMethod: 'cash_on_delivery'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('shippingAddress.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        shippingAddress: {
          ...formData.shippingAddress,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let stripePaymentIntentId = null;

      if (formData.paymentMethod === 'stripe') {
        if (!stripe || !elements) {
          throw new Error('Stripe has not loaded yet.');
        }

        // 1. Create Payment Intent on the backend
        const intentRes = await api.post('/payments/create-intent', { amount: totalPrice });
        const { clientSecret } = intentRes.data;

        // 2. Confirm Card Payment
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: user?.name,
              email: user?.email,
              address: {
                city: formData.shippingAddress.city,
                country: 'PK', // Assuming PK for now, or use formData.shippingAddress.country
                line1: formData.shippingAddress.street,
                postal_code: formData.shippingAddress.zipCode,
                state: formData.shippingAddress.state
              }
            },
          }
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        if (result.paymentIntent.status === 'succeeded') {
          stripePaymentIntentId = result.paymentIntent.id;
        }
      }

      // 3. Place Order
      const res = await api.post('/orders', {
        ...formData,
        stripePaymentIntentId
      });

      // 4. Save Address if checked
      if (saveAddress) {
        try {
          const userRes = await api.put('/users/me', { address: formData.shippingAddress });
          updateUser(userRes.data.user);
        } catch (err) {
          console.error('Failed to save address:', err);
        }
      }

      await clearCart();
      navigate(`/orders/${res.data.orders[0]._id}`, {
        state: { message: 'Order placed successfully!' }
      });
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || error.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-12">
      <div className="lg:w-2/3 space-y-8">
        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
          <h2 className="text-xl font-bold tracking-tight text-black mb-6">Shipping Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black mb-1">Street Address</label>
              <input type="text" name="shippingAddress.street" value={formData.shippingAddress.street} onChange={handleChange} required className="input-field" placeholder="123 Main St, Apt 4B" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">City</label>
              <input type="text" name="shippingAddress.city" value={formData.shippingAddress.city} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">State / Province</label>
              <input type="text" name="shippingAddress.state" value={formData.shippingAddress.state} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Zip / Postal Code</label>
              <input type="text" name="shippingAddress.zipCode" value={formData.shippingAddress.zipCode} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Country</label>
              <input type="text" name="shippingAddress.country" value={formData.shippingAddress.country} onChange={handleChange} required className="input-field" />
            </div>
          </div>
          <div className="mt-6 flex items-center">
            <input 
              type="checkbox" 
              id="saveAddress" 
              checked={saveAddress} 
              onChange={(e) => setSaveAddress(e.target.checked)} 
              className="w-4 h-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange cursor-pointer" 
            />
            <label htmlFor="saveAddress" className="ml-2 text-sm text-gray-700 cursor-pointer select-none">
              Save this address as my default for future orders
            </label>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
          <h2 className="text-xl font-bold tracking-tight text-black mb-6">Payment Method</h2>
          <div className="space-y-4">
            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${formData.paymentMethod === 'cash_on_delivery' ? 'border-brand-orange bg-orange-50' : 'border-border bg-gray-50'}`}>
              <input type="radio" name="paymentMethod" value="cash_on_delivery" checked={formData.paymentMethod === 'cash_on_delivery'} onChange={handleChange} className="w-4 h-4 text-brand-orange focus:ring-brand-orange border-gray-300" />
              <span className="ml-3 font-medium text-black">Cash on Delivery</span>
            </label>
            
            <div className={`p-4 border rounded-lg transition-colors ${formData.paymentMethod === 'stripe' ? 'border-brand-orange bg-orange-50' : 'border-border bg-gray-50'}`}>
              <label className="flex items-center cursor-pointer mb-4">
                <input type="radio" name="paymentMethod" value="stripe" checked={formData.paymentMethod === 'stripe'} onChange={handleChange} className="w-4 h-4 text-brand-orange focus:ring-brand-orange border-gray-300" />
                <span className="ml-3 font-medium text-black">Credit/Debit Card</span>
              </label>
              {formData.paymentMethod === 'stripe' && (
                <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                  <CardElement options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                  }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:w-1/3">
        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm sticky top-24">
          <h2 className="text-xl font-bold tracking-tight text-black mb-6">Order Summary</h2>
          
          <div className="space-y-4 mb-6 pb-6 border-b border-border">
            {cart.items.map((item) => (
              <div key={item._id} className="flex gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-lg border border-border p-1 flex-shrink-0 flex items-center justify-center">
                  <img src={item.product.images?.[0] || 'https://via.placeholder.com/150'} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  <p className="text-sm font-semibold text-black mt-1">{formatPricePKR((item.product.price || item.price) * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-sm mb-6 pb-6 border-b border-border text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-black font-medium">{formatPricePKR(cartTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-black font-medium">{formatPricePKR(shippingPrice)}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-gray-100">
              <span>Estimated Tax ({taxRate * 100}%)</span>
              <span className="text-black font-medium">{formatPricePKR(taxPrice)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8">
            <span className="text-base font-bold text-black">Total</span>
            <span className="text-2xl font-bold tracking-tight text-brand-orange">{formatPricePKR(totalPrice)}</span>
          </div>

          <button
            type="submit"
            disabled={loading || (formData.paymentMethod === 'stripe' && !stripe)}
            className="btn-primary w-full py-4 text-base flex justify-center items-center shadow-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {loading ? 'Processing...' : 'Confirm Order'}
          </button>
        </div>
      </div>
    </form>
  );
};

const Checkout = () => {
  const { cart, cartTotal } = useCart();
  const navigate = useNavigate();

  const [shippingPrice, setShippingPrice] = useState(10);
  const [taxRate, setTaxRate] = useState(0.1);

  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

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
    fetchSettings();
  }, [cartTotal]);

  if (!cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  const taxPrice = cartTotal * taxRate;
  const totalPrice = cartTotal + shippingPrice + taxPrice;

  return (
    <div className="bg-gray-50 min-h-screen py-12 animate-fade-in">
      <div className="container mx-auto px-6 max-w-6xl">
        <button onClick={() => navigate('/cart')} className="mb-8 text-sm font-medium text-gray-500 hover:text-black flex items-center transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cart
        </button>

        <h1 className="text-3xl font-bold tracking-tight text-black mb-10">Checkout</h1>

        <Elements stripe={stripePromise}>
          <CheckoutForm 
            cart={cart} 
            cartTotal={cartTotal} 
            shippingPrice={shippingPrice} 
            taxRate={taxRate}
            taxPrice={taxPrice} 
            totalPrice={totalPrice} 
          />
        </Elements>
      </div>
    </div>
  );
};

export default Checkout;
