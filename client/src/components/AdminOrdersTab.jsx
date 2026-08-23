import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { formatPricePKR } from '../utils/currency';
import Pagination from './Pagination';

const AdminOrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modals
  const [shippingModal, setShippingModal] = useState({ isOpen: false, orderId: null });
  const [shippingData, setShippingData] = useState({ trackingNumber: '', courier: '', estimatedDeliveryDate: '' });
  const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null });
  const [cancelReason, setCancelReason] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const fetchOrders = async (currentPage) => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/all?page=${currentPage}&limit=10&search=${searchTerm}&status=${statusFilter}`);
      setOrders(res.data.orders || []);
      setTotalPages(res.data.pages || 1);
      setPage(res.data.page || 1);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const onUpdateStatus = async (orderId, status, shippingDetails = null) => {
    try {
      const payload = { status };
      if (shippingDetails) {
        Object.assign(payload, shippingDetails);
      }
      await api.put(`/orders/${orderId}/status`, payload);
      toast.success('Order status updated successfully');
      fetchOrders(page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const onTogglePayment = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/pay`);
      toast.success('Payment status updated successfully');
      fetchOrders(page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update payment status');
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    if (newStatus === 'shipped') {
      setShippingModal({ isOpen: true, orderId });
      setShippingData({ trackingNumber: '', courier: '', estimatedDeliveryDate: '' });
    } else if (newStatus === 'cancelled') {
      setCancelModal({ isOpen: true, orderId });
      setCancelReason('');
    } else {
      onUpdateStatus(orderId, newStatus);
    }
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    onUpdateStatus(shippingModal.orderId, 'shipped', shippingData);
    setShippingModal({ isOpen: false, orderId: null });
  };

  const handleCancelSubmit = (e) => {
    e.preventDefault();
    if (cancelReason.trim().length < 5) {
      alert('Reason must be at least 5 characters');
      return;
    }
    onUpdateStatus(cancelModal.orderId, 'cancelled', { reason: cancelReason });
    setCancelModal({ isOpen: false, orderId: null });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="return_requested">Return Requested</option>
            <option value="returned">Returned</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="relative">
            <label htmlFor="order-search" className="sr-only">Search orders by ID</label>
            <input
              id="order-search"
              type="search"
              placeholder="Search by Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {shippingModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Enter Shipping Details</h3>
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Courier Name</label>
                <input type="text" placeholder="e.g. TCS, Leopard" required className="w-full p-2 border rounded" value={shippingData.courier} onChange={(e) => setShippingData({...shippingData, courier: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tracking Number</label>
                <input type="text" placeholder="Tracking Number" required className="w-full p-2 border rounded" value={shippingData.trackingNumber} onChange={(e) => setShippingData({...shippingData, trackingNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estimated Delivery Date</label>
                <input type="date" required className="w-full p-2 border rounded" value={shippingData.estimatedDeliveryDate} onChange={(e) => setShippingData({...shippingData, estimatedDeliveryDate: e.target.value})} />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShippingModal({ isOpen: false, orderId: null })} className="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-orange text-white rounded">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cancelModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-red-600 mb-4">Cancel Order</h3>
            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cancellation Reason</label>
                <textarea 
                  required 
                  minLength={5}
                  placeholder="Provide a reason..." 
                  className="w-full p-2 border rounded resize-none h-24" 
                  value={cancelReason} 
                  onChange={(e) => setCancelReason(e.target.value)} 
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setCancelModal({ isOpen: false, orderId: null })} className="px-4 py-2 text-gray-600">Back</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Confirm Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No orders found.</div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
                <div className="w-full">
                  <Link to={`/orders/${order._id}`} className="font-semibold text-brand-orange hover:underline">
                    Order #{order._id.slice(-8)}
                  </Link>
                  <p className="text-sm text-gray-600">
                    {order.user?.name} - {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Total: {formatPricePKR(order.totalPrice)}</p>

                  {/* Shipping Info Display */}
                  {order.status === 'shipped' && order.trackingNumber && (
                    <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                      <p><span className="font-semibold">Courier:</span> {order.courier}</p>
                      <p><span className="font-semibold">Tracking:</span> {order.trackingNumber}</p>
                      <p><span className="font-semibold">Est. Delivery:</span> {new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {/* Cancel Info Display */}
                  {order.status === 'cancelled' && order.cancellationReason && (
                    <div className="mt-2 text-sm bg-red-50 text-red-800 p-2 rounded border border-red-100">
                      <p><span className="font-semibold">Reason:</span> {order.cancellationReason}</p>
                    </div>
                  )}

                  {/* Return Info Display */}
                  {['return_requested', 'returned'].includes(order.status) && order.returnReason && (
                    <div className="mt-2 text-sm bg-amber-50 text-amber-800 p-2 rounded border border-amber-100">
                      <p><span className="font-semibold">Return Reason:</span> {order.returnReason}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-start md:items-end space-y-2 w-full md:w-auto mt-4 md:mt-0">
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="px-3 py-1 border rounded-lg text-sm bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="return_requested" disabled>Return Requested</option>
                      <option value="returned">Returned (Refund & Restock)</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      order.status === 'returned' ? 'bg-gray-100 text-gray-800' :
                      order.status === 'return_requested' ? 'bg-amber-100 text-amber-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Admin Payment Toggle */}
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => onTogglePayment(order._id)}
                      className={`px-3 py-1 text-xs rounded font-semibold ${order.isPaid
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                    >
                      {order.isPaid ? 'Paid' : 'Mark as Paid'}
                    </button>
                  )}
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-2">Items:</p>
                <div className="space-y-1">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="text-sm text-gray-600">
                      {item.name} x {item.quantity} - {formatPricePKR(item.price)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        onPageChange={setPage} 
      />
    </div>
  );
};

export default AdminOrdersTab;
