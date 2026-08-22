import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatPricePKR } from '../utils/currency';
import { ArrowLeft, Edit2, X, Check, Truck, CreditCard, MapPin, Loader2, XCircle, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returning, setReturning] = useState(false);

  const [editingItems, setEditingItems] = useState(false);
  const [updatedItems, setUpdatedItems] = useState([]);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.order);
      setUpdatedItems(res.data.order.orderItems);
    } catch (error) {
      console.error('Error fetching order:', error);
      Swal.fire('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const canEditOrder = (status) => ['pending'].includes(status) && order && !order.isPaid;
  const canCancelOrder = (status) => ['pending', 'accepted'].includes(status);
  const canReturnOrder = (status) => status === 'delivered';

  const handleCancelOrder = async () => {
    if (!cancelReason.trim() || cancelReason.trim().length < 5) { 
      Swal.fire('Please provide a reason of at least 5 characters'); 
      return; 
    }
    setCancelling(true);
    try {
      await api.put(`/orders/${id}/cancel`, { reason: cancelReason });
      setShowCancelModal(false);
      await fetchOrder();
    } catch (error) {
      Swal.fire(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleRequestReturn = async () => {
    if (!returnReason.trim() || returnReason.trim().length < 5) {
      Swal.fire('Please provide a return reason of at least 5 characters');
      return;
    }
    setReturning(true);
    try {
      await api.put(`/orders/${id}/return`, { reason: returnReason });
      setShowReturnModal(false);
      await fetchOrder();
      Swal.fire('Return Requested Successfully', '', 'success');
    } catch (error) {
      Swal.fire(error.response?.data?.message || 'Failed to request return');
    } finally {
      setReturning(false);
    }
  };

  const handleUpdateOrder = async () => {
    try {
      await api.put(`/orders/${id}`, { orderItems: updatedItems });
      await fetchOrder();
      setEditingItems(false);
    } catch (error) {
      Swal.fire(error.response?.data?.message || 'Failed to update order');
    }
  };

  const handleQuantityChange = (index, val) => {
    if (val < 1) return;
    const item = updatedItems[index];
    if (val > (item.product?.stock || 0)) { Swal.fire('Exceeds stock'); return; }
    const updated = [...updatedItems];
    updated[index].quantity = val;
    setUpdatedItems(updated);
  };

  const handleRemoveItem = (index) => {
    if (updatedItems.length === 1) { Swal.fire('Cannot remove all items. Cancel order instead.'); return; }
    setUpdatedItems(updatedItems.filter((_, i) => i !== index));
  };

  if (loading) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-black" />
    </div>
  );
  if (!order) return <div className="text-center py-20 font-medium">Order not found</div>;

  const renderTrackingTimeline = (order) => {
    const statuses = ['pending', 'accepted', 'processing', 'shipped', 'delivered'];
    const currentIdx = statuses.indexOf(order.status);
    
    if (order.status === 'cancelled') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-center text-red-600 font-medium">
          Order Cancelled on {new Date(order.cancelledAt || order.updatedAt).toLocaleDateString()}
        </div>
      );
    }

    return (
      <div className="mb-10 bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <h3 className="text-lg font-bold mb-6">Order Status</h3>
        <div className="flex items-center min-w-[600px]">
          {statuses.map((s, idx) => {
            const isCompleted = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            const historyItem = order.statusHistory?.find(h => h.status === s);
            
            return (
              <div key={s} className="relative flex-1 text-center">
                <div className="flex items-center justify-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                    isCompleted ? 'bg-brand-orange border-brand-orange text-white' : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {idx + 1}
                  </div>
                </div>
                {idx !== statuses.length - 1 && (
                  <div className={`absolute top-4 left-1/2 w-full h-1 -z-0 ${
                    idx < currentIdx ? 'bg-brand-orange' : 'bg-gray-200'
                  }`} />
                )}
                <div className="mt-3">
                  <p className={`text-sm font-semibold capitalize ${isCurrent ? 'text-brand-orange' : isCompleted ? 'text-black' : 'text-gray-400'}`}>
                    {s}
                  </p>
                  {historyItem && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(historyItem.timestamp).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getTrackingUrl = (courier, trackingNumber) => {
    if (!courier || !trackingNumber) return null;
    const c = courier.toLowerCase();
    if (c.includes('tcs')) return `https://www.tcsexpress.com/tracking?track=${trackingNumber}`;
    if (c.includes('leopard')) return `https://www.leopardscourier.com/tracking?track=${trackingNumber}`;
    if (c.includes('pakistan post')) return `http://ep.gov.pk/tracking.asp`;
    return null; // fallback if unknown courier
  };

  const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const newTaxPrice = newTotal * 0.1;
  const newTotalPrice = newTotal + order.shippingPrice + newTaxPrice;
  const isCustomer = user && user.role !== 'admin';

  return (
    <div className="bg-gray-50 min-h-screen py-10 animate-fade-in">
      <div className="container mx-auto px-6 max-w-6xl">
        {isCustomer && (
          <button onClick={() => navigate('/orders')} className="mb-8 text-sm font-medium text-gray-500 hover:text-black flex items-center transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </button>
        )}

        {renderTrackingTimeline(order)}

        {order.status === 'shipped' && order.trackingNumber && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-blue-800">
            <h3 className="font-bold text-lg mb-2">Shipping Information</h3>
            <p><strong>Courier:</strong> {order.courier || 'N/A'}</p>
            <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
            <p><strong>Estimated Delivery:</strong> {order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'N/A'}</p>
            {getTrackingUrl(order.courier, order.trackingNumber) && (
              <a 
                href={getTrackingUrl(order.courier, order.trackingNumber)} 
                target="_blank" 
                rel="noreferrer"
                className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Track Package Online
              </a>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-border pb-6 gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-black mb-1">Order #{order._id.slice(-8)}</h1>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-widest w-fit ${order.status === 'delivered' ? 'bg-green-50 text-green-700' : order.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-black'}`}>
                  {order.status}
                </div>
              </div>

              {order.status === 'cancelled' && order.cancellationReason && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                  <h3 className="font-semibold mb-1">Cancellation Reason</h3>
                  <p className="text-sm">{order.cancellationReason}</p>
                </div>
              )}

              {['return_requested', 'returned'].includes(order.status) && order.returnReason && (
                <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                  <h3 className="font-semibold mb-1">Return Reason</h3>
                  <p className="text-sm">{order.returnReason}</p>
                </div>
              )}

              {/* Actions */}
              {isCustomer && (canEditOrder(order.status) || canCancelOrder(order.status) || canReturnOrder(order.status)) && (
                <div className="flex flex-wrap gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-border">
                  {!editingItems ? (
                    <>
                      {canEditOrder(order.status) && (
                        <button onClick={() => setEditingItems(true)} className="btn-secondary bg-white shadow-sm flex items-center">
                          <Edit2 className="w-4 h-4 mr-2" /> Edit Items
                        </button>
                      )}
                      {canCancelOrder(order.status) && (
                        <button onClick={() => setShowCancelModal(true)} className="btn-secondary bg-white text-red-600 hover:text-red-700 hover:border-red-200 shadow-sm flex items-center">
                          <XCircle className="w-4 h-4 mr-2" /> Cancel Order
                        </button>
                      )}
                      {canReturnOrder(order.status) && (
                        <button onClick={() => setShowReturnModal(true)} className="btn-secondary bg-white text-amber-600 hover:text-amber-700 hover:border-amber-200 shadow-sm flex items-center">
                          <RefreshCw className="w-4 h-4 mr-2" /> Request Return
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button onClick={handleUpdateOrder} className="btn-primary text-sm"><Check className="w-4 h-4 mr-2" /> Save Changes</button>
                      <button onClick={() => { setEditingItems(false); setUpdatedItems(order.orderItems); }} className="btn-secondary bg-white text-sm">Cancel Edit</button>
                    </>
                  )}
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">{editingItems ? 'Edit Items' : 'Items'}</h3>
                <div className="space-y-4">
                  {(editingItems ? updatedItems : order.orderItems).map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-xl border border-border gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-lg border border-border p-1">
                          <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div>
                          <p className="font-semibold text-black text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatPricePKR(item.price)} each</p>
                        </div>
                      </div>
                      
                      {editingItems ? (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-border rounded-lg bg-white h-9">
                            <button onClick={() => handleQuantityChange(idx, item.quantity - 1)} className="px-3 h-full hover:bg-gray-50 rounded-l-lg">-</button>
                            <span className="w-10 text-center text-sm font-medium border-x border-border">{item.quantity}</span>
                            <button onClick={() => handleQuantityChange(idx, item.quantity + 1)} className="px-3 h-full hover:bg-gray-50 rounded-r-lg">+</button>
                          </div>
                          <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700 p-2"><X className="w-5 h-5" /></button>
                        </div>
                      ) : (
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Qty: {item.quantity}</p>
                          <p className="font-bold text-black">{formatPricePKR(item.price * item.quantity)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {order.trackingNumber && (
              <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
                <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-6 flex items-center"><Truck className="w-4 h-4 mr-2" /> Tracking Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl border border-border"><p className="text-xs text-gray-500 mb-1">Courier</p><p className="font-semibold text-black">{order.courier}</p></div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-border"><p className="text-xs text-gray-500 mb-1">Tracking ID</p><p className="font-mono font-bold text-black">{order.trackingNumber}</p></div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-border"><p className="text-xs text-gray-500 mb-1">Est. Delivery</p><p className="font-semibold text-black">{order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'N/A'}</p></div>
                </div>
              </div>
            )}
          </div>

          <div className="xl:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-border shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-black mb-6">Summary</h3>
              <div className="space-y-4 text-sm mb-6 pb-6 border-b border-border text-gray-600">
                <div className="flex justify-between"><span>Items</span><span className="text-black font-medium">{formatPricePKR(editingItems ? newTotal : order.itemsPrice)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span className="text-black font-medium">{formatPricePKR(order.shippingPrice)}</span></div>
                <div className="flex justify-between"><span>Tax</span><span className="text-black font-medium">{formatPricePKR(editingItems ? newTaxPrice : order.taxPrice)}</span></div>
              </div>
              <div className="flex justify-between items-center mb-8">
                <span className="text-base font-bold text-black">Total</span>
                <span className="text-2xl font-bold tracking-tight text-black">{formatPricePKR(editingItems ? newTotalPrice : order.totalPrice)}</span>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center"><MapPin className="w-3 h-3 mr-1" /> Delivery</h4>
                  <p className="text-sm font-medium text-black">{order.shippingAddress?.street}</p>
                  <p className="text-sm text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                  <p className="text-sm text-gray-600">{order.shippingAddress?.country}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center"><CreditCard className="w-3 h-3 mr-1" /> Payment</h4>
                  <p className="text-sm font-medium text-black capitalize">
                    {order.paymentMethod === 'stripe' ? 'Credit Card' : order.paymentMethod?.replace('_', ' ') || 'N/A'}
                  </p>
                  {order.isPaid ? (
                     <p className="text-xs text-green-600 font-semibold mt-1">Paid on {new Date(order.paidAt).toLocaleDateString()}</p>
                  ) : (
                     <p className="text-xs text-gray-500 mt-1">
                       {order.paymentMethod === 'cod' || order.paymentMethod === 'Cash on Delivery' 
                         ? 'Pending payment on delivery' 
                         : 'Pending payment confirmation'}
                     </p>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold tracking-tight text-red-600 mb-2">Cancel Order</h3>
            <p className="text-gray-500 text-sm mb-6 border-b border-border pb-4">Are you sure? A full refund will be processed within 5-7 business days if paid.</p>
            <div className="mb-8">
              <label className="block text-sm font-medium text-black mb-2">Reason</label>
              <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Please tell us why..." className="input-field bg-gray-50 resize-none h-24" />
            </div>
            <div className="flex gap-4">
              <button onClick={() => { setShowCancelModal(false); setCancelReason(''); }} disabled={cancelling} className="btn-secondary flex-1 bg-white">Keep Order</button>
              <button onClick={handleCancelOrder} disabled={cancelling} className="btn-primary flex-1 bg-red-600 hover:bg-red-700">{cancelling ? 'Cancelling...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}

      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold tracking-tight text-amber-600 mb-2">Request Return</h3>
            <p className="text-gray-500 text-sm mb-6 border-b border-border pb-4">Are you sure you want to return this order? Please specify the reason for your return below. We will process a full refund once the item is received back.</p>
            <div className="mb-8">
              <label className="block text-sm font-medium text-black mb-2">Return Reason</label>
              <textarea value={returnReason} onChange={(e) => setReturnReason(e.target.value)} placeholder="Please tell us why you are returning this item..." className="input-field bg-gray-50 resize-none h-24" />
            </div>
            <div className="flex gap-4">
              <button onClick={() => { setShowReturnModal(false); setReturnReason(''); }} disabled={returning} className="btn-secondary flex-1 bg-white">Cancel</button>
              <button onClick={handleRequestReturn} disabled={returning} className="btn-primary flex-1 bg-amber-500 hover:bg-amber-600 border-none">{returning ? 'Submitting...' : 'Confirm Return'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
