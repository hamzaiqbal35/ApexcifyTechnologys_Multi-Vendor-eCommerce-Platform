import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { formatPricePKR } from '../utils/currency';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    if (location.state?.message) {
      alert(location.state.message);
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading order details...</div>;
  }

  if (!order) {
    return <div className="container mx-auto px-4 py-12 text-center">Order not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/orders')}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Back to Orders
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Order #{order._id.slice(-8)}</h1>
            <p className="text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <span className={`mt-2 md:mt-0 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        {order.trackingNumber && (
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <p className="font-semibold mb-1">Tracking Number</p>
            <p className="text-lg">{order.trackingNumber}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image || 'https://via.placeholder.com/100'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">Price: {formatPricePKR(item.price)}</p>
                      {item.vendor && (
                        <p className="text-sm text-gray-500 mt-1">
                          Vendor: {item.vendor.vendorInfo?.businessName || item.vendor.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="font-semibold text-lg">{formatPricePKR(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Items Price</span>
                <span>{formatPricePKR(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatPricePKR(order.shippingPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatPricePKR(order.taxPrice)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPricePKR(order.totalPrice)}</span>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-2">Shipping Address</h3>
              <p className="text-sm text-gray-600">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </p>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-2">Payment Method</h3>
              <p className="text-sm text-gray-600 capitalize">
                {order.paymentMethod.replace('_', ' ')}
              </p>
              {order.isPaid ? (
                <p className="text-green-600 text-sm mt-1">Paid on {new Date(order.paidAt).toLocaleDateString()}</p>
              ) : (
                <p className="text-yellow-600 text-sm mt-1">Not Paid</p>
              )}
            </div>

            {order.isDelivered && (
              <div className="border-t pt-4 mt-4">
                <p className="text-green-600 text-sm">
                  Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

