import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPricePKR } from '../utils/currency';
import { Star, Minus, Plus, Loader2, ArrowLeft, PlayCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  return `${baseUrl}${path}`;
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  useEffect(() => {
    fetchProduct();
  }, [id]);
  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(product._id, quantity);
      // Optional: Add a toast notification here
    } catch (error) {
      Swal.fire(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setSubmittingReview(true);
      await api.post(`/products/${id}/reviews`, review);
      await fetchProduct();
      setReview({ rating: 5, comment: '' });
    } catch (error) {
      Swal.fire(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <p className="text-xl font-medium text-black">Product not found</p>
        <button onClick={() => navigate('/products')} className="mt-4 text-gray-500 hover:text-black flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen animate-fade-in">
      <div className="container mx-auto px-6 py-12">
        <button onClick={() => navigate(-1)} className="mb-8 text-sm font-medium text-gray-500 hover:text-black flex items-center transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 border border-border rounded-2xl overflow-hidden flex items-center justify-center p-8 relative">
              {product.images?.[activeImage] && product.images[activeImage].match(/\.(mp4|webm|ogg)$/i) ? (
                <video
                  src={getMediaUrl(product.images[activeImage])}
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <img
                  src={getMediaUrl(product.images?.[activeImage]) || 'https://via.placeholder.com/600'}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain mix-blend-multiply"
                />
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => {
                  const isVideo = img.match(/\.(mp4|webm|ogg)$/i);
                  const mediaSrc = getMediaUrl(img);
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative aspect-square bg-gray-50 border rounded-xl overflow-hidden transition-all ${
                        activeImage === idx ? 'border-black ring-1 ring-black' : 'border-border hover:border-gray-400'
                      }`}
                    >
                      {isVideo ? (
                        <>
                          <video src={mediaSrc} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <PlayCircle className="text-white w-6 h-6" />
                          </div>
                        </>
                      ) : (
                        <img src={mediaSrc} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover mix-blend-multiply p-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <div className="mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">{product.category}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-4 leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-8">
              <p className="text-3xl font-medium tracking-tight text-black">{formatPricePKR(product.price)}</p>
              {product.averageRating > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-border rounded-full text-sm">
                  <Star className="w-4 h-4 fill-black text-black" />
                  <span className="font-semibold">{product.averageRating.toFixed(1)}</span>
                  <span className="text-gray-500 font-normal">({product.numReviews})</span>
                </div>
              )}
            </div>

            <div className="prose prose-sm md:prose-base text-gray-600 mb-10 leading-relaxed">
              <p>{product.description}</p>
            </div>
            
            <div className="border-t border-border pt-8 mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-medium text-black mb-1">Status</p>
                  <p className={`text-sm ${product.stock > 0 ? 'text-gray-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}
                  </p>
                </div>

              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border border-border rounded-lg h-12 w-full sm:w-32 bg-white">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex-1 flex items-center justify-center hover:bg-gray-50 transition-colors h-full rounded-l-lg text-gray-500 hover:text-black"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 flex items-center justify-center text-sm font-medium text-black border-x border-border h-full">
                  {quantity}
                </div>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="flex-1 flex items-center justify-center hover:bg-gray-50 transition-colors h-full rounded-r-lg text-gray-500 hover:text-black"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {!isAdmin && (
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 btn-primary h-12 text-base shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-border pt-16 mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-black mb-10">Customer Reviews</h2>
          
          {/* Reviews List */}
          <div className="space-y-8 mb-16">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev, idx) => (
                <div key={idx} className="pb-8 border-b border-gray-100 last:border-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 border border-border rounded-full flex items-center justify-center text-black font-semibold text-sm">
                        {rev.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-black">{rev.user?.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-black text-black' : 'fill-gray-200 text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  {rev.comment && <p className="text-gray-600 text-sm leading-relaxed">{rev.comment}</p>}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-border">
                <p className="text-gray-500">No reviews yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>

          {/* Add Review Form */}
          {isAuthenticated ? (
            <div className="bg-gray-50 border border-border rounded-2xl p-8">
              <h3 className="text-lg font-bold text-black mb-6">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div>
                  <label htmlFor="review-rating" className="block text-sm font-medium text-black mb-2">Rating</label>
                  <select
                    id="review-rating"
                    name="rating"
                    value={review.rating}
                    onChange={(e) => setReview({ ...review, rating: parseInt(e.target.value) })}
                    className="input-field max-w-xs"
                  >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Average</option>
                    <option value={2}>2 - Poor</option>
                    <option value={1}>1 - Terrible</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="review-comment" className="block text-sm font-medium text-black mb-2">Your Review</label>
                  <textarea
                    id="review-comment"
                    name="comment"
                    value={review.comment}
                    onChange={(e) => setReview({ ...review, comment: e.target.value })}
                    rows="4"
                    className="input-field resize-none bg-white"
                    placeholder="What did you like or dislike?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-primary px-8 flex items-center"
                >
                  {submittingReview ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">Please <a href="/login" className="text-black font-medium underline underline-offset-4">log in</a> to write a review.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
