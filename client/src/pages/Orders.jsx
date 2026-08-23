import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getMediaUrl } from '../utils/api';
import { formatPricePKR } from '../utils/currency';
import { Package, ArrowRight, Filter } from 'lucide-react';
import Pagination from '../components/Pagination';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders(page, statusFilter);
  }, [page, statusFilter]);

  const fetchOrders = async (currentPage, currentStatus) => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/my-orders?page=${currentPage}&limit=5&status=${currentStatus}`);
      setOrders(res.data.orders);
      setTotalPages(res.data.pages || 1);
      setPage(res.data.page || 1);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-400 font-medium tracking-widest uppercase text-sm">Loading Orders...</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-12 animate-fade-in">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-black">Order History</h1>
          
          <div className="flex items-center gap-2 bg-gray-50 border border-border rounded-lg px-3 py-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-none text-sm font-medium text-black focus:ring-0 outline-none cursor-pointer pr-4"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="return_requested">Return Requested</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 border border-border rounded-2xl">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6 text-sm max-w-sm mx-auto">You haven't placed any orders. Start exploring our collection.</p>
            <Link to="/products" className="btn-primary inline-flex items-center px-8">
              Start Shopping <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl border border-border shadow-sm hover:border-black transition-colors group">
                <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-black text-lg">Order #{order._id.slice(-8)}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest ${
                        order.status === 'delivered' ? 'bg-green-50 text-green-700' :
                        order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                        'bg-gray-100 text-black'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div className="text-left md:text-right w-full md:w-auto">
                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-black">{formatPricePKR(order.totalPrice)}</p>
                  </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex flex-col">
                    <div className="flex -space-x-4">
                      {order.orderItems.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="w-14 h-14 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center p-1 z-10 relative group-hover:-translate-y-1 transition-transform" style={{ transitionDelay: `${idx * 50}ms` }}>
                          <img src={getMediaUrl(item.image) || 'https://via.placeholder.com/100'} alt={item.name} className="w-full h-full object-contain mix-blend-multiply rounded-full" />
                        </div>
                      ))}
                      {order.orderItems.length > 4 && (
                        <div className="w-14 h-14 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center z-10 relative text-xs font-bold text-gray-500 group-hover:-translate-y-1 transition-transform delay-200">
                          +{order.orderItems.length - 4}
                        </div>
                      )}
                    </div>

                    {/* Mini Status Indicator */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4 overflow-hidden">
                      {['pending', 'accepted', 'processing', 'shipped', 'delivered'].includes(order.status) && (
                        <div 
                          className={`${order.status === 'delivered' ? 'bg-green-500' : 'bg-brand-orange'} h-1.5 rounded-full transition-all`}
                          style={{ 
                            width: 
                              order.status === 'pending' ? '20%' : 
                              order.status === 'accepted' ? '40%' : 
                              order.status === 'processing' ? '60%' : 
                              order.status === 'shipped' ? '80%' : 
                              order.status === 'delivered' ? '100%' : '0%' 
                          }}
                        ></div>
                      )}
                      {['cancelled', 'returned'].includes(order.status) && (
                        <div className="bg-red-500 h-1.5 rounded-full w-full transition-all"></div>
                      )}
                      {order.status === 'return_requested' && (
                        <div className="bg-yellow-500 h-1.5 rounded-full w-full transition-all"></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                    {order.trackingNumber && (
                      <div className="flex-1 lg:flex-none px-4 py-2 bg-gray-50 rounded-lg border border-border text-sm text-center sm:text-left">
                        <span className="text-gray-500 mr-2">Track:</span>
                        <span className="font-mono font-medium text-black break-all">{order.trackingNumber}</span>
                      </div>
                    )}
                    <Link to={`/orders/${order._id}`} className="btn-secondary whitespace-nowrap lg:px-8 text-center w-full sm:w-auto">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {orders.length > 0 && (
          <div className="mt-8">
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
