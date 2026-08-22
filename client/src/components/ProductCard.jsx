import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPricePKR } from '../utils/currency';
import { ShoppingBag, Star, PlayCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  return `${baseUrl}${path}`;
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in to add items to your cart.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Log In',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }
    try {
      await addToCart(product._id, 1);
      // Removed alert, consider using toast in a real app, but sticking to logic.
    } catch (error) {
      Swal.fire(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  return (
    <div className="group flex flex-col bg-white border border-border rounded-lg overflow-hidden hover:border-black transition-colors duration-300">
      <Link to={`/products/${product._id}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        {product.images?.[0] && product.images[0].match(/\.(mp4|webm|ogg)$/i) ? (
          <>
            <video src={getMediaUrl(product.images[0])} className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute top-3 right-3 bg-black/60 p-1 rounded text-white backdrop-blur-sm z-10">
              <PlayCircle size={16} />
            </div>
          </>
        ) : (
          <img
            src={getMediaUrl(product.images?.[0]) || 'https://via.placeholder.com/400'}
            alt={product.name}
            className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
          />
        )}
        
        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.stock === 0 && (
            <span className="bg-black text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm">
              Sold Out
            </span>
          )}
          {product.stock > 0 && product.stock < 10 && (
            <span className="bg-gray-100 text-black border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm">
              Low Stock
            </span>
          )}
        </div>
      </Link>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/products/${product._id}`}>
            <h3 className="font-medium text-black leading-tight line-clamp-1 group-hover:underline underline-offset-4">{product.name}</h3>
          </Link>
          {product.averageRating > 0 && (
            <div className="flex items-center text-xs text-gray-500 ml-2 whitespace-nowrap">
              <Star className="w-3 h-3 fill-black text-black mr-1" />
              <span>{product.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">{product.description}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-transparent group-hover:border-border transition-colors">
          <span className="font-semibold text-black tracking-tight">{formatPricePKR(product.price)}</span>
          
          {!isAdmin && (
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
