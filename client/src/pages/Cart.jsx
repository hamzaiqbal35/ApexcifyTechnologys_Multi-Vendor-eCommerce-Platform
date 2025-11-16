import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPricePKR } from '../utils/currency';

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
    return <div className="container mx-auto px-4 py-12 text-center">Loading cart...</div>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some products to get started!</p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const item = cart.items.find(i => i._id === itemId);
    const product = item.product;
    if (newQuantity > product.stock) {
      alert(`Only ${product.stock} items available in stock`);
      return;
    }
    await updateCartItem(itemId, newQuantity);
  };

  const handleRemove = async (itemId) => {
    if (window.confirm('Remove this item from cart?')) {
      await removeFromCart(itemId);
    }
  };

  const shippingPrice = 10;
  const taxPrice = cartTotal * 0.1;
  const totalPrice = cartTotal + shippingPrice + taxPrice;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {cart.items.map((item) => {
              const product = item.product;
              return (
                <div key={item._id} className="border-b last:border-b-0 p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to={`/products/${product._id}`}>
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/150'}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link to={`/products/${product._id}`}>
                        <h3 className="font-semibold text-lg hover:text-blue-600">{product.name}</h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-2">{formatPricePKR(product.price)} each</p>
                      <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="text-red-600 hover:text-red-800 mb-2"
                      >
                        Remove
                      </button>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          className="w-8 h-8 border rounded flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          className="w-8 h-8 border rounded flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-semibold mt-2">
                        {formatPricePKR((product.price || item.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPricePKR(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatPricePKR(shippingPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatPricePKR(taxPrice)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPricePKR(totalPrice)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Proceed to Checkout
            </Link>
            <Link
              to="/products"
              className="block w-full text-center mt-4 text-blue-600 hover:text-blue-800"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

